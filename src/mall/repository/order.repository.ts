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

  create(order: OrderEntity): void {
    this.orders.save(order)
  }

  createPayment(payment: PaymentEntity): void {
    this.payments.save(payment)
  }
}
