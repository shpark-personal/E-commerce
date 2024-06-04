import { Module, Global } from '@nestjs/common'
import { Redis } from 'ioredis'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis({
          host: '127.0.0.1', // Redis 서버 주소
          port: 6379, // Redis 서버 포트
        })
        return client
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
