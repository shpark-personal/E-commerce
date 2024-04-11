import { PointResult, ProductResult, StockResult } from '../models/Result'

export const IUSER_REPOSITORY = 'User Repository'
export interface IUserRepository {
  charge(id: string, point: number): PointResult
  get(id: string): PointResult
}

export const IPRODUCT_REPOSITORY = 'Product Repository'
export interface IProductRepository {
  getProduct(id: number): Promise<ProductResult>
}

export const ISTOCK_REPOSITORY = 'Stock Repository'
export interface IStockRepository {
  getStock(id: number): StockResult
  enoughStock(id: number, amount: number): boolean
}
