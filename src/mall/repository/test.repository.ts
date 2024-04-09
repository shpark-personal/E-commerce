import { Injectable } from '@nestjs/common'
import { PointResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { User } from '../models/Entities'
import { IUserRepository } from './mall.interface'

@Injectable()
export class TestRepository implements IUserRepository {
  private readonly table: Map<string, User> = new Map()

  // USER REPOSITORY
  charge(id: string, point: number): PointResult {
    // validation : id, point (minus)

    const userPoint = { id: id, point: point }
    let ec = Errorcode.Success
    try {
      this.table.set(id, userPoint)
    } catch {
      ec = Errorcode.InvalidRequest
    } finally {
      const updated = this.table.get(id) ?? { id: id, point: 0 }
      return { errorcode: ec, point: updated.point }
    }
  }

  get(id: string): PointResult {
    // validation
    const updated = this.table.get(id) ?? { id: id, point: 0 }
    return { errorcode: Errorcode.Success, point: updated.point }
  }

  //
}
