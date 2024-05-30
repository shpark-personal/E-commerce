import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../models/Entities'
import { IUserRepository } from './mall.interface'
import { PointResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async charge(id: string, point: number): Promise<PointResult> {
    if (!ValidPointChecker(point)) return { errorcode: Errorcode.InvalidAmount }

    const user = await this.find(id)
    if (!user) {
      const newUser = this.users.create({ id: id, point: point })
      await this.users.save(newUser)
    } else {
      user.point += point
      await this.save(user)
    }

    const updatedUser = await this.find(id)
    if (!updatedUser) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, point: updatedUser.point }
  }

  async get(id: string): Promise<PointResult> {
    const user = await this.find(id)
    return user
      ? { errorcode: Errorcode.Success, point: user.point }
      : { errorcode: Errorcode.InvalidRequest }
  }

  async use(id: string, point: number): Promise<PointResult> {
    try {
      const user = await this.find(id)
      if (!user) return { errorcode: Errorcode.InvalidRequest }

      const remainPoint = user.point - point
      if (remainPoint < 0) return { errorcode: Errorcode.LackOfPoint }

      user.point = remainPoint
      const result = await this.save(user)

      return result
        ? { errorcode: Errorcode.Success, point: remainPoint }
        : { errorcode: Errorcode.InvalidRequest }
    } catch {
      return { errorcode: Errorcode.InvalidRequest }
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

  private async find(id: string): Promise<User> {
    return !ValidIdChecker(id)
      ? null
      : this.users.findOne({ where: { id: id } })
  }
}
