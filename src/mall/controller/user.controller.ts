import {
  Controller,
  Patch,
  Param,
  Body,
  ValidationPipe,
  Get,
} from '@nestjs/common'
import { ChargeDto } from '../models/DTOs'
import { PointResult } from '../models/Result'
import { UserService } from '../service/user.service'

@Controller('mall/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // 잔액 충전
  @Patch('charge/:id')
  async charge(
    @Param('id') userId: string,
    @Body(ValidationPipe) chargeDto: ChargeDto,
  ): Promise<PointResult> {
    return await this.userService.charge(userId, chargeDto.amount)
  }

  // 잔액 조회
  @Get('point/:id')
  async point(@Param('id') userId: string): Promise<PointResult> {
    return await this.userService.getPoint(userId)
  }
}
