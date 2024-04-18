import { Errorcode } from '../models/Enums'
import { ProductRepository } from './product.repository'

describe('productRepositoryTest', () => {
  const repository = new ProductRepository({
    findOne: jest.fn(),
  } as unknown as ConstructorParameters<typeof ProductRepository>[0])

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
