import { TestingModule, Test } from '@nestjs/testing'
import {
  IUSER_REPOSITORY,
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
  IORDER_REPOSITORY,
} from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { PayService } from './pay.service'
// import { Errorcode } from '../models/Enums'

describe('PayService', () => {
  let service: PayService
  let repo: TestRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayService,
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
    expect(repo).toBeDefined()
  })

  describe('pay', () => {
    const date = new Date()
    beforeEach(async () => {
      await repo.insertSeedOrders(date)
    })

    // it('success', async () => {
    //   const result = await service.pay('userA', `${date}`)
    //   expect(result.errorcode).toEqual(Errorcode.Success)
    // })

    // it('fail : lack of point', async () => {
    //   // 임의로 현재 point를 모두 사용함
    //   const user = await repo.get('userA')
    //   await repo.use('userA', user.point)

    //   const result = await service.pay('userA', `${date}`)
    //   expect(result.errorcode).toEqual(Errorcode.LackOfPoint)
    // })
  })
})
