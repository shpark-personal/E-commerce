import { Errorcode } from '../models/Enums'
import { UserRepository } from './user.repository'

describe('userRepositoryTest', () => {
  const repository = new UserRepository({
    save: jest.fn(),
    findOne: jest.fn(),
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
      jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)
      jest.spyOn(repository['users'], 'save').mockResolvedValue(updated)

      expect(await repository.use('userA', 5)).toEqual({
        errorcode: Errorcode.Success,
        point: updated.point,
      })
    })

    it('fail to use point', async () => {
      jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)

      expect(await repository.use('userA', 10)).toEqual({
        errorcode: Errorcode.LackOfPoint,
      })
    })
  })
})
