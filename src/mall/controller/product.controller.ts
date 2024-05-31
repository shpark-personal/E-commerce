import { Controller, Get, Param } from '@nestjs/common'
import { ProductDetailResult, ProductsResult } from '../models/Result'
import { ProductService } from '../service/product.service'

@Controller('mall/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 상품 조회
  @Get(':productId')
  async searchProductDetail(
    @Param('productId') productId: number,
  ): Promise<ProductDetailResult> {
    return await this.productService.getDetail(productId)
  }

  // 상위 상품 조회
  @Get('ranked')
  async searchRankedProducts(
    @Param('period') period: number | null, // day 기준
    @Param('top') top: number | null, // 몇 개의 item?
  ): Promise<ProductsResult> {
    return await this.productService.getRankedProducts(
      new Date(),
      period ?? 3,
      top ?? 5,
    )
  }
}
