import { Injectable } from '@nestjs/common'
import { PointResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { User } from '../models/Entities'
import { IUserRepository } from './mall.interface'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'

@Injectable()
export class TestRepository implements IUserRepository {
  private readonly table: Map<string, User> = new Map()

  // USER REPOSITORY
  charge(id: string, point: number): PointResult {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    if (!ValidPointChecker(point)) return { errorcode: Errorcode.InvalidAmount }

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
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    const info = this.table.get(id)
    if (info == null) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, point: info.point }
  }
}
