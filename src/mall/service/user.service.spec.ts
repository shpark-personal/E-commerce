import { Errorcode } from '../models/Enums'
import { IUserRepository } from '../repository/mall.interface'
import { UserService } from './user.service'
import { PointResult } from '../models/Result'

describe('UserService', () => {
  let userService: UserService
  let userRepositoryMock: IUserRepository

  beforeEach(() => {
    userRepositoryMock = {
      charge: jest.fn(),
      get: jest.fn(),
      use: jest.fn(),
    }
    userService = new UserService(userRepositoryMock)
  })

  describe('charge', () => {
    it('should charge user with specified amount', async () => {
      const userId = 'user123'
      const amount = 50
      const expectedResult: PointResult = {
        errorcode: Errorcode.Success,
        point: amount,
      }
      jest.spyOn(userRepositoryMock, 'charge').mockResolvedValue(expectedResult)

      const result = await userService.charge(userId, amount)

      expect(result).toEqual(expectedResult)
      expect(userRepositoryMock.charge).toHaveBeenCalledWith(userId, amount)
    })

    it('should not charge minus amount', async () => {
      const userId = 'user123'
      const amount = -50
      const expectedResult: PointResult = {
        errorcode: Errorcode.InvalidAmount,
      }
      jest.spyOn(userRepositoryMock, 'charge').mockResolvedValue(expectedResult)

      const result = await userService.charge(userId, amount)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('getPoint', () => {
    it('should get user point', async () => {
      const userId = 'user123'
      const expectedResult: PointResult = {
        errorcode: Errorcode.Success,
        point: 50,
      }
      jest.spyOn(userRepositoryMock, 'get').mockResolvedValue(expectedResult)

      const result = await userService.getPoint(userId)

      expect(result).toEqual(expectedResult)
      expect(userRepositoryMock.get).toHaveBeenCalledWith(userId)
    })

    it('should not get unknown user', async () => {
      const userId = 'user123'
      const expectedResult: PointResult = {
        errorcode: Errorcode.UnknownUser,
      }
      jest.spyOn(userRepositoryMock, 'get').mockResolvedValue(expectedResult)

      const result = await userService.getPoint(userId)

      expect(result).toEqual(expectedResult)
      expect(userRepositoryMock.get).toHaveBeenCalledWith(userId)
    })
  })

  describe('usePoint', () => {
    it('should use point', async () => {
      const userId = 'user123'
      const amount = 50
      const expectedResult: PointResult = {
        errorcode: Errorcode.Success,
        point: amount,
      }
      jest.spyOn(userRepositoryMock, 'use').mockResolvedValue(expectedResult)

      const result = await userService.use(userId, amount)

      expect(result).toEqual(expectedResult)
      expect(userRepositoryMock.use).toHaveBeenCalledWith(userId, amount)
    })

    it('should not use point by UnknownUser', async () => {
      const userId = 'user123'
      const amount = 50
      const expectedResult: PointResult = {
        errorcode: Errorcode.UnknownUser,
      }
      jest.spyOn(userRepositoryMock, 'use').mockResolvedValue(expectedResult)

      const result = await userService.use(userId, amount)

      expect(result).toEqual(expectedResult)
    })

    it('should not use point by minus point', async () => {
      const userId = 'user123'
      const amount = -50
      const expectedResult: PointResult = {
        errorcode: Errorcode.InvalidAmount,
      }
      jest.spyOn(userRepositoryMock, 'use').mockResolvedValue(expectedResult)

      const result = await userService.use(userId, amount)

      expect(result).toEqual(expectedResult)
    })
  })
})
