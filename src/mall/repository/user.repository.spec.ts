import { Repository, DataSource, QueryRunner } from 'typeorm'
import { User } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { UserRepository } from './user.repository'

describe('userRepositoryTest', () => {
  let repository: UserRepository
  let userRepoMock: Partial<Repository<User>>
  let dataSourceMock: Partial<DataSource>
  let queryRunnerMock: Partial<QueryRunner>

  beforeEach(() => {
    // Mock repository methods
    userRepoMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn(),
      } as unknown as QueryRunner['manager'],
      // manager: {
      //   save: jest.fn(),
      //   findOne: jest.fn(),
      // } as unknown as EntityManager,
    }

    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    }

    repository = new UserRepository(
      userRepoMock as Repository<User>,
      dataSourceMock as DataSource,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('charge', async () => {
    const user = {
      id: 'userA',
      point: 10,
    }

    jest.spyOn(userRepoMock, 'save').mockResolvedValue(user)
    jest.spyOn(userRepoMock, 'findOne').mockResolvedValue(user)
    // jest.spyOn(repository['users'], 'create')

    const result = await repository.charge(user.id, user.point)

    expect(userRepoMock.findOne).toHaveBeenCalledWith(
      user.id,
      expect.anything(),
    )
    expect(userRepoMock.create).toHaveBeenCalledWith(user)
    expect(userRepoMock.save).toHaveBeenCalledWith(user, expect.anything())
    expect(result).toEqual({ errorcode: Errorcode.Success, point: user.point })
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled()
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
