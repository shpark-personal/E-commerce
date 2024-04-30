import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Test, TestingModule } from '@nestjs/testing'

describe('AppController (e2e)', () => {
  let app
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('should concurrently send requests', async () => {
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app.getHttpServer())
          .patch('/mall/user/:id/charge')
          .send({ id: '1', amount: 10 - i })
          .expect(200),
      )
    }

    await Promise.all(requests)
  })

  afterAll(async () => {
    await app.close()
  })
})
