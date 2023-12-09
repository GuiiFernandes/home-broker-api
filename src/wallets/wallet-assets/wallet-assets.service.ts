import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';

@Injectable()
export class WalletAssetsService {
  constructor(private prismaService: PrismaService) {}

  all({ wallet_id }: { wallet_id: string }) {
    return this.prismaService.walletAsset.findMany({
      where: { wallet_id },
      include: {
        Asset: {
          select: { id: true, symbol: true, price: true },
        },
      },
    });
  }

  create({
    wallet_id,
    asset_id,
    shares,
  }: {
    wallet_id: string;
    asset_id: string;
    shares: number;
  }) {
    return this.prismaService.walletAsset.create({
      data: {
        wallet_id,
        asset_id,
        shares,
      },
    });
  }
}
