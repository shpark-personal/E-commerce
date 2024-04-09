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
import { IUSER_REPOSITORY, IUserRepository } from '../repository/mall.interface'

@Injectable()
export class MallService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  charge(userId: string, amount: number): PointResult {
    return this.userRepository.charge(userId, amount)
  }

  point(userId: string): PointResult {
    return this.userRepository.get(userId)
  }

  getDetail(productId: number): ProductResult {
    const p = {
      id: productId,
      name: '달력',
      quantity: 3,
    }
    return { errorcode: Errorcode.Success, product: p }
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
