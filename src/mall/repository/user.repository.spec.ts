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
    jest.spyOn(repository['users'], 'findOne').mockResolvedValue(user)

    expect(await repository.charge('userA', 10)).toEqual({
      errorcode: Errorcode.Success,
      point: user.point,
    })
  })
})
