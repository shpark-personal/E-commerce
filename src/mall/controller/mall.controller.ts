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
  async charge(
    @Param('id') userId: string,
    @Body(ValidationPipe) chargeDto: ChargeDto,
  ): Promise<PointResult> {
    return await this.mallService.charge(userId, chargeDto.amount)
  }

  // 잔액 조회
  @Get('user/:id/point')
  async point(@Param('id') userId: string): Promise<PointResult> {
    return await this.mallService.getPoint(userId)
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
  async order(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderListDto: OrderListDto,
  ): Promise<SimpleResult> {
    return await this.mallService.order(userId, orderListDto.products)
  }

  // 결제
  @Post('order/:id/pay')
  async pay(
    @Param('id') userId: string,
    @Body(ValidationPipe) orderId: string,
  ): Promise<SimpleResult> {
    return await this.mallService.pay(userId, orderId)
  }

  // 상위 상품 조회
  @Get('product/ranked')
  searchRankedProducts(): ProductsResult {
    return this.mallService.getRankedProducts()
  }
}
