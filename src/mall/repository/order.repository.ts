import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderEntity, PaymentEntity } from '../models/Entities'
import { IOrderRepository } from './mall.interface'

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity)
    private readonly payments: Repository<PaymentEntity>,
  ) {}

  async createOrder(order: OrderEntity): Promise<void> {
    await this.orders.save(order)
  }

  async deleteOrder(order: OrderEntity): Promise<void> {
    await this.orders.remove(order)
  }

  async createPayment(payment: PaymentEntity): Promise<void> {
    await this.payments.save(payment)
  }

  async getOrder(orderId: string): Promise<OrderEntity> {
    return await this.orders.findOne({
      where: { id: orderId },
    })
  }
}
