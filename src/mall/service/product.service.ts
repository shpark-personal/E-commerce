import { Inject, Injectable } from '@nestjs/common'
import { Errorcode } from '../models/Enums'
import { ProductDetailResult, ProductsResult } from '../models/Result'
import {
  IPRODUCT_REPOSITORY,
  IProductRepository,
  ISTOCK_REPOSITORY,
  IStockRepository,
} from '../repository/mall.interface'

@Injectable()
export class ProductService {
  constructor(
    @Inject(IPRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,

    @Inject(ISTOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  async getDetail(productId: number): Promise<ProductDetailResult> {
    const detailInfo = await this.productRepository.getProduct(productId)
    const stockInfo = await this.stockRepository.getStock(productId)
    if (detailInfo.errorcode != Errorcode.Success)
      return { errorcode: detailInfo.errorcode }
    if (stockInfo.errorcode != Errorcode.Success)
      return { errorcode: stockInfo.errorcode }
    return {
      errorcode: Errorcode.Success,
      product: detailInfo.product,
      quantity: stockInfo.quantity,
    }
  }

  async getRankedProducts(
    time: Date,
    period: number,
    top: number,
  ): Promise<ProductsResult> {
    return {
      products: await this.productRepository.getSales(time, period, top),
    }
  }
}
