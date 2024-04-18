import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult'
import { Errorcode } from '../models/Enums'
import { UserRepository } from './user.repository'

describe('userRepositoryTest', () => {
  const repository = new UserRepository({
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  } as unknown as ConstructorParameters<typeof UserRepository>[0])

  it('charge', async () => {
    const user = {
      id: 'userA',
      point: 10,
    }
    jest.spyOn(repository['users'], 'save').mockResolvedValue(user)
    jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)

    expect(await repository.charge('userA', 10)).toEqual({
      errorcode: Errorcode.Success,
      point: user.point,
    })
  })

  describe('get', () => {
    const user = {
      id: 'userA',
      point: 10,
    }

    it('success to get', async () => {
      jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)

      expect(await repository.get('userA')).toEqual({
        errorcode: Errorcode.Success,
        point: user.point,
      })
    })

    it('fail to get', async () => {
      jest.spyOn(repository['users'], 'findOne').mockRejectedValue(user)

      expect(await repository.get('userA')).toEqual({
        errorcode: Errorcode.InvalidRequest,
      })
    })
  })

  describe('use', () => {
    const user = {
      id: 'userA',
      point: 10,
    }
    const updated = {
      id: 'userA',
      point: 5,
    }

    it('success to use point', async () => {
      const result: UpdateResult = {
        affected: 0,
        raw: undefined,
        generatedMaps: [],
      }

      jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)
      jest.spyOn(repository['users'], 'update').mockResolvedValue(result)

      expect(await repository.use('userA', 5)).toEqual({
        errorcode: Errorcode.Success,
        point: updated.point,
      })
    })

    it('fail to use point', async () => {
      const result: UpdateResult = {
        affected: 1,
        raw: undefined,
        generatedMaps: [],
      }

      jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)
      jest.spyOn(repository['users'], 'update').mockResolvedValue(result)

      expect(await repository.use('userA', 5)).toEqual({
        errorcode: Errorcode.InvalidRequest,
      })
    })
  })
})
