import { Redis } from 'ioredis'

export async function withSpinlock<T>(
  redisClient: Redis,
  lockKey: string,
  ttl: number,
  task: () => Promise<T>,
): Promise<T> {
  const lockValue = Date.now().toString()
  // ttl : timeout
  // PX : ttl의 단위 (밀리초)
  // NX : 키가 존재하지 않을 때만 설정하도록 함
  // (다른 프로세스가 잠금 설정했을 때, 현재 프로세스가 잠금 설정하지 못하도록함)
  const acquired = await redisClient.set(lockKey, lockValue, 'PX', ttl, 'NX')

  if (!acquired) {
    throw new Error('Unable to acquire lock')
  }

  try {
    return await task()
  } finally {
    const lockCheck = await redisClient.get(lockKey)
    if (lockCheck === lockValue) {
      await redisClient.del(lockKey)
    }
  }
}
