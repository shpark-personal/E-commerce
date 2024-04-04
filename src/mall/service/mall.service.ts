/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import {
  PointResult,
  SimpleResult,
  ProductsResult,
  ProductResult,
} from '../models/Result'
import { ProductItem } from '../models/Product'
import { Errorcode } from '../models/Enums'

@Injectable()
export class MallService {
  charge(userId: string, amount: any): PointResult {
    return { errorcode: Errorcode.Success, point: 0 }
  }

  point(userId: string): PointResult {
    return { errorcode: Errorcode.Success, point: 0 }
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
