import { Test, TestingModule } from '@nestjs/testing'
import { OrderService } from './order.service'
import {
  IORDER_REPOSITORY,
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
  IUSER_REPOSITORY,
} from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { Errorcode } from '../models/Enums'

describe('OrderService', () => {
  let service: OrderService
  // let repo: TestRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: IUSER_REPOSITORY,
          useClass: TestRepository,
        },
        {
          provide: IPRODUCT_REPOSITORY,
          useClass: TestRepository,
        },
        {
          provide: ISTOCK_REPOSITORY,
          useClass: TestRepository,
        },
        {
          provide: IORDER_REPOSITORY,
          useClass: TestRepository,
        },
      ],
    }).compile()

    service = module.get<OrderService>(OrderService)
    // repo = module.get<TestRepository>(IUSER_REPOSITORY)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    // expect(repo).toBeDefined()
  })

  describe('order', () => {
    it('success', async () => {
      const li = [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 4 },
      ]
      const result = await service.order('userA', li)
      expect(result.errorcode).toEqual(Errorcode.Success)
    })

    it('fail : out of stock', async () => {
      const li = [{ id: 1, quantity: 100 }]
      const result = await service.order('userA', li)
      expect(result.errorcode).toEqual(Errorcode.OutOfStock)
    })

    it('fail : lack of point', async () => {
      const li = [
        { id: 1, quantity: 9 },
        { id: 2, quantity: 4 },
      ]
      const result = await service.order('userA', li)
      expect(result.errorcode).toEqual(Errorcode.LackOfPoint)
    })
  })
})
