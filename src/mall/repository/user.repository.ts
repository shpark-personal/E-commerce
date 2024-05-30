import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../models/Entities'
import { IUserRepository } from './mall.interface'
import { PointResult } from '../models/Result'
import { Errorcode } from '../models/Enums'

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async charge(id: string, point: number): Promise<PointResult> {
    let user = await this.findOne(id)
    if (!user) {
      user = this.users.create({ id: id, point: point })
    } else {
      user.point += point
    }
    await this.save(user)

    const updatedUser = await this.findOne(id)
    return { errorcode: Errorcode.Success, point: updatedUser.point }
  }

  async get(id: string): Promise<PointResult> {
    const user = await this.findOne(id)
    return { errorcode: Errorcode.Success, point: user.point }
  }

  async use(id: string, point: number): Promise<PointResult> {
    try {
      const user = await this.findOne(id)
      const remainPoint = user.point - point
      if (remainPoint < 0) return { errorcode: Errorcode.LackOfPoint }

      user.point = remainPoint
      await this.save(user)
      return { errorcode: Errorcode.Success, point: remainPoint }
    } catch {
      return { errorcode: Errorcode.UnknownError }
    }
  }

  private async save(user: User): Promise<boolean> {
    try {
      this.users.save(user)
      // await this.users.manager.transaction(async em => {
      //   await em.save<User>(
      //     Object.assign(user, {
      //       where: { id: user.id },
      //       lock: { mode: 'pessimistic_write' },
      //     }),
      //   )
      // })
      return true
    } catch {
      return false
    }
  }

  private async findOne(id: string): Promise<User> {
    return this.users.findOne({ where: { id: id } })
  }
}
