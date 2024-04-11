import { Errorcode } from './Enums'
import { Product } from './Product'

export class SimpleResult {
  errorcode: Errorcode
}

export class PointResult {
  errorcode: Errorcode
  point?: number
}

export class ProductResult {
  errorcode: Errorcode
  product?: Product
}

export class StockResult {
  errorcode: Errorcode
  quantity?: number
}

export class ProductDetailResult {
  errorcode: Errorcode
  product?: Product
  quantity?: number
}

export class ProductsResult {
  errorcode: Errorcode
  products: Product[]
}
