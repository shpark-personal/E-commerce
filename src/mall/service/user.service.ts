import { Inject, Injectable } from '@nestjs/common'
import { PointResult } from '../models/Result'
import { IUSER_REPOSITORY, IUserRepository } from '../repository/mall.interface'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'
import { Errorcode } from '../models/Enums'

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async charge(userId: string, amount: number): Promise<PointResult> {
    if (!ValidPointChecker(amount))
      return { errorcode: Errorcode.InvalidAmount }
    return await this.userRepository.charge(userId, amount)
  }

  async getPoint(userId: string): Promise<PointResult> {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.UnknownUser }

    return await this.userRepository.get(userId)
  }

  async use(userId: string, point: number): Promise<PointResult> {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.UnknownUser }
    if (!ValidPointChecker(point)) return { errorcode: Errorcode.InvalidAmount }
    return await this.userRepository.use(userId, point)
  }
}
