import { IsInt } from 'class-validator'
import { ProductItem } from './Product'

export class ChargeDto {
  @IsInt()
  amount: number
}

export class OrderListDto {
  // FIXME
  // @IsArray(ProductItem[])
  products: ProductItem[]
}
