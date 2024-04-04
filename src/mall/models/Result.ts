import { Errorcode } from './Enums'
import { Product } from './Product'

export class SimpleResult {
  errorcode: Errorcode
}

export class PointResult {
  errorcode: Errorcode
  point: number
}

export class ProductResult {
  errorcode: Errorcode
  product: Product
}

export class ProductsResult {
  errorcode: Errorcode
  products: Product[]
}
