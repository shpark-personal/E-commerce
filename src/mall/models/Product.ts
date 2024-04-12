// Entity, Request용 DTO, Response용 Type은 필요에 맞게 각각 정의한다.
export class Product {
  id: number
  name: string
  price: number
}

export class ProductItem {
  id: number
  amount: number
}
