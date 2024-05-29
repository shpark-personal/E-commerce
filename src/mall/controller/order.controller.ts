import { Body, Controller, Param, Post, ValidationPipe } from '@nestjs/common'
import { OrderService } from '../service/order.service'
import { OrderListDto } from '../models/DTOs'
import { SimpleResult } from '../models/Result'
import { PayService } from '../service/pay.service'

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly payService: PayService,
  ) {}

  // 주문
  @Post(':id')
  async order(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderListDto: OrderListDto,
  ): Promise<SimpleResult> {
    return await this.orderService.order(userId, orderListDto.products)
  }

  // 결제
  @Post('pay/:id')
  async pay(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderId: string,
  ): Promise<SimpleResult> {
    return await this.payService.pay(userId, orderId)
  }
}
