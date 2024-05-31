import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { todo } from 'node:test'
import { HttpStatus } from '@nestjs/common'
import { User } from '../src/mall/models/Entities'
import { Repository } from 'typeorm'

describe('AppController (e2e)', () => {
  let app
  let userRepository: Repository<User>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    userRepository = moduleFixture.get('UserRepository')
  })

  beforeEach(async () => {
    await userRepository.clear()
  })

  it('charge point', async () => {
    const id = 'John'
    const response = await request(app.getHttpServer())
      .patch(`/user/charge/${id}`)
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

  // it('should concurrently send requests', async () => {
  //   const requests = []
  //   for (let i = 0; i < 10; i++) {
  //     requests.push(
  //       request(app.getHttpServer())
  //         .patch('/user/charge/:id')
  //         .send({ id: '1', amount: 10 - i })
  //         .expect(200),
  //     )
  //   }

  //   await Promise.all(requests)
  // })

  afterAll(async () => {
    await app.close()
  })
})
