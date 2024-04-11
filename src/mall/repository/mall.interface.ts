import { PointResult, ProductResult } from '../models/Result'

export const IUSER_REPOSITORY = 'User Repository'
export interface IUserRepository {
  charge(id: string, point: number): PointResult
  get(id: string): PointResult
}

export const IPRODUCT_REPOSITORY = 'Product Repository'
export interface IProductRepository {
  getDetail(id: number): Promise<ProductResult>
}
