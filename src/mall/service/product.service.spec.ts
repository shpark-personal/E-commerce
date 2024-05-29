import { TestingModule, Test } from '@nestjs/testing'
import { Errorcode } from '../models/Enums'
import {
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
} from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { ProductService } from './product.service'
import { Product } from '../models/Product'

describe('ProductService', () => {
  let service: ProductService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: IPRODUCT_REPOSITORY,
          useClass: TestRepository,
        },
        {
          provide: ISTOCK_REPOSITORY,
          useClass: TestRepository,
        },
      ],
    }).compile()
    service = module.get<ProductService>(ProductService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get product details', () => {
    // FIXME : cannot insert???
    // beforeEach(() => repo.insertSeedProducts())

    it('success', async () => {
      const result = await service.getDetail(1)
      const p = { id: 1, name: 'product_1', price: 1000 }
      expect(result).toEqual({
        errorcode: Errorcode.Success,
        product: p,
        quantity: 10,
      })
    })

    it('fail', async () => {
      const result = await service.getDetail(6)
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })
  })

  describe('get rank', () => {
    it('success', async () => {
      const period = 3
      const top = 3
      const li: Product[] = [
        { id: 5, name: 'product_5', price: 1000 },
        { id: 4, name: 'product_4', price: 1000 },
        { id: 3, name: 'product_3', price: 1000 },
        { id: 2, name: 'product_2', price: 1000 },
        { id: 1, name: 'product_1', price: 1000 },
      ]
      const result = await service.getRankedProducts(new Date(), period, top)
      expect(result).toEqual({
        products: li.slice(0, top),
      })
    })
  })
})
