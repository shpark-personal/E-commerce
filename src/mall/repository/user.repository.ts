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

  charge(id: string, point: number): PointResult {
    let newPoint
    this.users.save({ id: id, point: point })
    this.users
      .findOne({
        where: { id: id },
      })
      .then(o => {
        newPoint = o.point
      })
      .catch(e => {
        console.log(e)
        // fixme  : return
      })
    return { errorcode: Errorcode.Success, point: newPoint }
  }

  get(id: string): PointResult {
    let newPoint
    this.users
      .findOne({
        where: { id: id },
      })
      .then(o => {
        newPoint = o.point
      })
      .catch(e => {
        console.log(e)
        // fixme  : return
      })
    return { errorcode: Errorcode.Success, point: newPoint }
  }
}
