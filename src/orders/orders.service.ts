import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { InitTransactionDto, InputExecuteTransactionDto } from './order.dto';
import { OrderStatus, OrderType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  all(filter: { wallet_id: string }) {
    return this.prismaService.order.findMany({
      where: filter,
      include: {
        Transactions: true,
        Asset: {
          select: { id: true, symbol: true },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async initTransaction(input: InitTransactionDto) {
    // antes de iniciar a transação, verifico se o ativo existe na carteira
    const walletAsset = await this.prismaService.walletAsset.findUnique({
      where: {
        wallet_id_asset_id: {
          asset_id: input.asset_id,
          wallet_id: input.wallet_id,
        },
      },
    });
    // se a ordem for de venda e o ativo não existir na carteira, não posso iniciar a ordem ou transação
    if (input.type === OrderType.SELL && !walletAsset) {
      throw new BadRequestException('Asset not found in wallet');
    }
    // Caso contrário, crie a ordem
    return this.prismaService.order.create({
      data: {
        ...input,
        status: OrderStatus.PENDING,
        partial: input.shares,
        version: 1,
      },
    });
    //PrismaService.$use() - permite que você intercepte as chamadas do Prisma Client e adicione lógica personalizada
  }

  // processamento da ordem de forma atomica (tudo ou nada) e com trava de concorrencia
  async executeTransaction({
    order_id,
    status,
    negotiated_shares,
    broker_transaction_id,
    price,
    related_investor_id,
  }: InputExecuteTransactionDto) {
    // recebo uma ordem do tipo InputExecuteTransactionDto
    // adicionar a transação em order
    return this.prismaService.$transaction(async (prisma) => {
      // poderia executar as operações dentro de [], mas como tenho uma lógica mais complexa uso uma callback assincrona  para executar ou reverter as operações
      // $transaction - permite que você execute várias operações de banco de dados em uma única transação e garante que todas as operações sejam executadas com sucesso ou revertidas
      const order = await prisma.order.findUniqueOrThrow({
        // findUniqueOrThrow - busca uma ordem pelo id ou retorna um erro
        where: { id: order_id },
      });
      await prisma.order.update({
        // atualizar a ordem com os dados das transações que foram executadas naquela ordem e atualiza o partial.
        where: { id: order_id, version: order.version },
        data: {
          status,
          partial: order.partial - negotiated_shares,
          Transactions: {
            create: {
              broker_transaction_id,
              price,
              shares: negotiated_shares,
              related_investor_id,
            },
          },
          version: { increment: 1 },
        },
      });
      // atualizar o status da ordem (OPEN ou CLOSED)
      if (status === OrderStatus.CLOSED) {
        // atualizar o preço do ativo
        await prisma.asset.update({
          where: { id: order.asset_id },
          data: {
            price,
          },
        });
        // busca se o ativo já existe na carteira para atualizar a quantidade
        const walletAsset = await prisma.walletAsset.findUnique({
          where: {
            wallet_id_asset_id: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
            },
          },
        });
        // contabilizar a quantidade de ativos na carteira
        if (walletAsset) {
          const mult = order.type === OrderType.BUY ? 1 : -1;
          // se o ativo já existe na carteira
          await prisma.walletAsset.update({
            // atualiza a quantidade de ativos na carteira
            where: {
              wallet_id_asset_id: {
                asset_id: order.asset_id,
                wallet_id: order.wallet_id,
              },
              version: walletAsset.version,
            },
            data: {
              shares: walletAsset.shares + order.shares * mult,
              version: { increment: 1 },
            },
          });
        } else {
          // se o ativo não existe na carteira
          await prisma.walletAsset.create({
            // cria o ativo na carteira
            data: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
              shares: negotiated_shares,
              version: 1,
            },
          });
        }
      }
    });
  }
}
