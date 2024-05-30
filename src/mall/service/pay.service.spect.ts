import { TestingModule, Test } from '@nestjs/testing'
import {
  IUSER_REPOSITORY,
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
  IORDER_REPOSITORY,
} from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { OrderService } from './order.service'
import { PayService } from './pay.service'
import { Errorcode } from '../models/Enums'

describe('PayService', () => {
  let service: PayService
  let repo: TestRepository

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
        TestRepository,
      ],
    }).compile()

    service = module.get<PayService>(PayService)
    repo = module.get<TestRepository>(TestRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    // expect(repo).toBeDefined()
  })

  describe('pay', () => {
    const date = new Date()
    beforeEach(async () => {
      await repo.insertSeedOrders(date)
    })
    it('success', async () => {
      const result = await service.pay('userA', `${date}`)
      expect(result.errorcode).toEqual(Errorcode.Success)
    })
  })
})
