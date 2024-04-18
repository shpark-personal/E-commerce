import { OrderEntity, PaymentEntity } from '../models/Entities'
import { PointResult, ProductResult, StockResult } from '../models/Result'

export const IUSER_REPOSITORY = 'User Repository'
export interface IUserRepository {
  charge(id: string, point: number): Promise<PointResult>
  get(id: string): Promise<PointResult>
  use(id: string, point: number): Promise<PointResult>
}

export const IPRODUCT_REPOSITORY = 'Product Repository'
export interface IProductRepository {
  getProduct(id: number): Promise<ProductResult>
}

export const ISTOCK_REPOSITORY = 'Stock Repository'
export interface IStockRepository {
  getStock(id: number): StockResult
  enoughStock(id: number, amount: number): boolean
  updateByOrder(order: OrderEntity): void
  updateByPay(orderId: string): void
}

export const IORDER_REPOSITORY = 'Order Repository'
export interface IOrderRepository {
  create(order: OrderEntity): Promise<void>
  createPayment(payment: PaymentEntity): Promise<void>
  getOrder(orderId: string): Promise<OrderEntity>
}
