import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { InitTransactionDto } from './order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  initTransaction(input: InitTransactionDto) {
    return this.prismaService.order.create({
      data: {
        ...input,
        status: OrderStatus.PENDING,
        partial: input.shares,
      },
    });
  }
}
