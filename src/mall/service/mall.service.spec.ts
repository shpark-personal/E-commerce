import { Test, TestingModule } from '@nestjs/testing'
import { MallService } from './mall.service'
import { IUSER_REPOSITORY } from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { Errorcode } from '../models/Enums'
import { todo } from 'node:test'

describe('MallService', () => {
  let service: MallService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MallService,
        {
          provide: IUSER_REPOSITORY,
          useClass: TestRepository,
        },
      ],
    }).compile()

    service = module.get<MallService>(MallService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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
      const result = service.point('userB')
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })

    it('fail : userId invalid', () => {
      const result = service.point('userA')
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })
    todo('userId validation')
    todo('notFound userId')
  })
})
