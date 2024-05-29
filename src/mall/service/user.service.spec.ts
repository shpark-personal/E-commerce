import { TestingModule, Test } from '@nestjs/testing'
import { todo } from 'node:test'
import { Errorcode } from '../models/Enums'
import { IUSER_REPOSITORY } from '../repository/mall.interface'
import { TestRepository } from '../repository/test.repository'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUSER_REPOSITORY,
          useClass: TestRepository,
        },
      ],
    }).compile()
    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('charge point', () => {
    it('success', async () => {
      const result = await service.charge('userA', 10)
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })

    it('fail : userId invalid', async () => {
      const result = await service.charge('', 10)
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })

    it('fail : minus point', async () => {
      const result = await service.charge('userA', -10)
      expect(result).toEqual({ errorcode: Errorcode.InvalidAmount })
    })
  })

  describe('get point', () => {
    beforeEach(async () => await service.charge('userB', 10))

    it('success', async () => {
      const result = await service.getPoint('userB')
      expect(result).toEqual({ errorcode: Errorcode.Success, point: 10 })
    })

    it('fail : userId invalid', async () => {
      const result = await service.getPoint('userC')
      expect(result).toEqual({ errorcode: Errorcode.InvalidRequest })
    })

    todo('notFound userId')
  })
})
