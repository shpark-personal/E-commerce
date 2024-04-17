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
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    if (!ValidPointChecker(point)) return { errorcode: Errorcode.InvalidAmount }
    await this.users.save({ id: id, point: point })
    return this.users
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, point: o.point }
      })
      .catch(e => {
        console.log(e)
        return { errorcode: Errorcode.InvalidRequest }
      })
  }

  async get(id: string): Promise<PointResult> {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    return this.users
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, point: o.point }
      })
      .catch(e => {
        console.log(e)
        return { errorcode: Errorcode.InvalidRequest }
      })
  }

  async use(id: string, point: number): Promise<PointResult> {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    let newPoint
    return this.users
      .findOne({
        where: { id: id },
      })
      .then(o => {
        newPoint = o.point - point
        o.point = newPoint
        return { errorcode: Errorcode.Success, point: newPoint }
      })
      .catch(e => {
        console.log(e)
        return { errorcode: Errorcode.InvalidRequest }
      })
  }
}
