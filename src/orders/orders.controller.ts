import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitTransactionDto } from './order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  InitTransactionDto(@Body() body: InitTransactionDto) {
    return this.ordersService.initTransaction(body);
  }
}
