import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { todo } from 'node:test'
import { HttpStatus } from '@nestjs/common'
import { User } from '../src/mall/models/Entities'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'

describe('AppController (e2e)', () => {
  let app
  let userRepository: Repository<User>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    )
  })

  beforeEach(async () => {
    await userRepository.clear()
  })

  it('charge point', async () => {
    const id = 'John'
    const response = await request(app.getHttpServer())
      .patch(`/mall/user/charge/${id}`)
      .send({ amount: 10 })
      .expect(HttpStatus.OK)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ errorcode: 'Success', point: 10 })

    const updatedUser = await userRepository.findOne({ where: { id: id } })
    expect(updatedUser).toBeDefined()
    expect(updatedUser.point).toEqual(10)
  })

  todo('get point')
  todo('search product')
  todo('search ranked')
  todo('order')
  todo('pay')

  it('should concurrently send requests', async () => {
    const id = 1
    const requests = []

    // 요청 배열 생성
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app.getHttpServer())
          .patch(`/mall/user/charge/${id}`)
          .send({ amount: 10 - i })
          .expect(200),
      )
    }

    // 모든 요청을 동시에 실행
    const responses = await Promise.all(requests)

    // 각 응답 검사
    responses.forEach((response, index) => {
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ errorcode: 'Success', point: 10 - index })
    })

    // 최종적으로 업데이트된 유저 데이터 확인
    const updatedUser = await userRepository.findOne({ where: { id: `${id}` } })
    expect(updatedUser).toBeDefined()

    // 총 포인트 계산
    const totalPoints = responses.reduce(
      (acc, _, index) => acc + (10 - index),
      0,
    )
    expect(updatedUser.point).toEqual(totalPoints)
  })

  afterAll(async () => {
    await app.close()
  })
})
