/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common'
import {
  PointResult,
  SimpleResult,
  ProductsResult,
  ProductResult,
} from '../models/Result'
import { ProductItem } from '../models/Product'
import { Errorcode } from '../models/Enums'
import {
  IPRODUCT_REPOSITORY,
  IProductRepository,
  ISTOCK_REPOSITORY,
  IStockRepository,
  IUSER_REPOSITORY,
  IUserRepository,
} from '../repository/mall.interface'

@Injectable()
export class MallService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(IPRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,

    @Inject(ISTOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  charge(userId: string, amount: number): PointResult {
    return this.userRepository.charge(userId, amount)
  }

  getPoint(userId: string): PointResult {
    return this.userRepository.get(userId)
  }

  async getDetail(productId: number): Promise<ProductResult> {
    return await this.productRepository.getDetail(productId)
  }

  order(userId: string, products: ProductItem[]): SimpleResult {
    return { errorcode: Errorcode.Success }
  }

  pay(userId: string, products: ProductItem[]): SimpleResult {
    return { errorcode: Errorcode.Success }
  }

  getRankedProducts(): ProductsResult {
    return { errorcode: Errorcode.Success, products: [] }
  }
}
