import { Test, TestingModule } from '@nestjs/testing'
import { MallService } from './mall.service'
import {
  IORDER_REPOSITORY,
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
  IUSER_REPOSITORY,
} from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { Errorcode } from '../models/Enums'
import { todo } from 'node:test'
import { OrderRepository } from '../repository/order.repository'

describe('MallService', () => {
  let service: MallService
  // let repo: TestRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MallService,
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
          useClass: OrderRepository,
        },
      ],
    }).compile()

    service = module.get<MallService>(MallService)
    // repo = module.get<TestRepository>(IUSER_REPOSITORY)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    // expect(repo).toBeDefined()
  })

  describe('charge point', () => {
    it('success', () => {
      const result = service.charge('userA', 10)
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })

    it('fail : userId invalid', () => {
      const result = service.charge('', 10)
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })

    it('fail : minus point', () => {
      const result = service.charge('userA', -10)
      expect(result).toEqual({ errorcode: Errorcode.InvalidAmount })
    })
  })

  describe('get point', () => {
    beforeEach(() => service.charge('userB', 10))

    it('success', () => {
      const result = service.getPoint('userB')
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })

    it('fail : userId invalid', () => {
      const result = service.getPoint('userA')
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })

    todo('notFound userId')
  })

  describe('get product details', () => {
    // FIXME : cannot insert???
    // beforeEach(() => repo.insertSeedProducts())

    it('success', async () => {
      const result = await service.getDetail(1)
      const p = { id: 1, name: 'product_1' }
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

  describe('order', () => {
    it('success', () => {
      const li = [
        { id: 1, amount: 3 },
        { id: 2, amount: 4 },
      ]
      const result = service.order('userA', li)
      expect(result).toEqual(Errorcode.Success)
    })
  })
})
