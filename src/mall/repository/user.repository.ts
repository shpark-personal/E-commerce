import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, QueryRunner, Repository } from 'typeorm'
import { User } from '../models/Entities'
import { IUserRepository } from './mall.interface'
import { PointResult } from '../models/Result'
import { Errorcode } from '../models/Enums'

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async charge(id: string, point: number): Promise<PointResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('REPEATABLE READ')

    try {
      let user = await this.findOne(id, queryRunner)
      if (!user) {
        user = this.users.create({ id: id, point: point })
        await this.insert(user, queryRunner)
      } else {
        user.point += point
        await this.update(user, queryRunner)
      }

      const updatedUser = await this.findOne(id, queryRunner)
      await queryRunner.commitTransaction()
      return { errorcode: Errorcode.Success, point: updatedUser.point }
    } catch {
      await queryRunner.rollbackTransaction()
      return { errorcode: Errorcode.UnknownError }
    } finally {
      await queryRunner.release()
    }
  }

  async get(id: string): Promise<PointResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('REPEATABLE READ')

    try {
      const user = await this.findOne(id, queryRunner)
      return { errorcode: Errorcode.Success, point: user.point }
    } catch {
      await queryRunner.rollbackTransaction()
      return { errorcode: Errorcode.UnknownUser }
    } finally {
      await queryRunner.release()
    }
  }

  async use(id: string, point: number): Promise<PointResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('REPEATABLE READ')

    try {
      const user = await this.findOne(id, queryRunner)
      const remainPoint = user.point - point
      if (remainPoint < 0) return { errorcode: Errorcode.LackOfPoint }

      user.point = remainPoint
      await this.update(user, queryRunner)
      await queryRunner.commitTransaction()
      return { errorcode: Errorcode.Success, point: remainPoint }
    } catch {
      await queryRunner.rollbackTransaction()
      return { errorcode: Errorcode.UnknownError }
    } finally {
      await queryRunner.release()
    }
  }

  private async insert(user: User, queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .insert()
      .into(User)
      .values(user)
      .execute()
  }

  private async update(user: User, queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .update(User)
      .set({ point: user.point })
      .where('id = :id', { id: user.id })
      .execute()
  }

  private async findOne(id: string, queryRunner: QueryRunner): Promise<User> {
    try {
      return await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id ', { id: id })
        .getOne()
    } catch {
      return null
    }
  }
}
