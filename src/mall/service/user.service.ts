import { Inject, Injectable } from '@nestjs/common'
import { PointResult } from '../models/Result'
import { IUSER_REPOSITORY, IUserRepository } from '../repository/mall.interface'

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async charge(userId: string, amount: number): Promise<PointResult> {
    return await this.userRepository.charge(userId, amount)
  }

  async getPoint(userId: string): Promise<PointResult> {
    return await this.userRepository.get(userId)
  }
}
