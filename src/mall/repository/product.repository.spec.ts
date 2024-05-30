import { Repository } from 'typeorm'
import { ProductEntity, SalesEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { ProductRepository } from './product.repository'
import { todo } from 'node:test'

describe('productRepositoryTest', () => {
  const productsRepository = {
    findOne: jest.fn(),
  }

  const salesRepository = {
    find: jest.fn(),
    save: jest.fn(),
  }

  const repository = new ProductRepository(
    productsRepository as unknown as Repository<ProductEntity>,
    salesRepository as unknown as Repository<SalesEntity>,
  )

  it('getProduct', async () => {
    const product = {
      id: 1,
      name: 'p1',
      price: 1234,
    }
    jest.spyOn(repository['products'], 'findOne').mockResolvedValue(product)

    expect(await repository.getProduct(1)).toEqual({
      errorcode: Errorcode.Success,
      product: product,
    })
  })

  todo('unknown product')
  todo('updateSales')
  // 이미 해당 날짜에 상품이 있을 때
  //                       없을 때

  todo('getSales')
  // period 일부일 때? 해당 기간에 판매된 상품이 없을 때,
  // 판매량 내림차순 확인
  // top수보다 판매된 상품 수가 적을 때
})
