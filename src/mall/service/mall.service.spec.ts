import { Test, TestingModule } from '@nestjs/testing'
import { MallService } from './mall.service'
import { IUSER_REPOSITORY } from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { Errorcode } from '../models/Enums'

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
    it('success to charge point', () => {
      const result = service.charge('userA', 10)
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })
  })

  describe('get point', () => {
    it('success to get point', () => {
      const result = service.point('userB')
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 0 })
    })
  })
})
