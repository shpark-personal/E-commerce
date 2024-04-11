import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { MallService } from '../service/mall.service'
import { ChargeDto, OrderListDto } from '../models/DTOs'
import {
  PointResult,
  SimpleResult,
  ProductsResult,
  ProductDetailResult,
} from '../models/Result'

@Controller('mall')
export class MallController {
  constructor(private readonly mallService: MallService) {}

  // 잔액 충전
  @Patch('user/:id/charge')
  charge(
    @Param('id') userId: string,
    @Body(ValidationPipe) chargeDto: ChargeDto,
  ): PointResult {
    return this.mallService.charge(userId, chargeDto.amount)
  }

  // 잔액 조회
  @Get('user/:id/point')
  point(@Param('id') userId: string): PointResult {
    return this.mallService.getPoint(userId)
  }

  // 상품 조회
  @Get('product/:productId')
  async searchProductDetail(
    @Param('productId') productId: number,
  ): Promise<ProductDetailResult> {
    return await this.mallService.getDetail(productId)
  }

  // 주문
  @Post('order/:id')
  order(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderListDto: OrderListDto,
  ): SimpleResult {
    return this.mallService.order(userId, orderListDto.products)
  }

  // 결제
  @Post('order/:id/pay')
  pay(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderListDto: OrderListDto,
  ): SimpleResult {
    return this.mallService.pay(userId, orderListDto.products)
  }

  // 상위 상품 조회
  @Get('product/ranked')
  searchRankedProducts(): ProductsResult {
    return this.mallService.getRankedProducts()
  }
}
