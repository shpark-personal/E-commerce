import { Repository } from 'typeorm'
import { ProductEntity, SalesEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { ProductRepository } from './product.repository'

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
})
