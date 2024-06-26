import { IsInt } from 'class-validator'
import { ProductItem } from './Product'
import { ApiProperty } from '@nestjs/swagger'

export class ChargeDto {
  @ApiProperty()
  @IsInt()
  amount: number
}

export class OrderListDto {
  // FIXME
  // @IsArray(ProductItem[])
  @ApiProperty()
  products: ProductItem[]
}
