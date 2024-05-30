import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../src/mall/service/user.service'
import {
  PointResult,
  ProductDetailResult,
  ProductsResult,
  SimpleResult,
} from '../src/mall/models/Result'
import { ProductService } from '../src/mall/service/product.service'
import { OrderService } from '../src/mall/service/order.service'
import { PayService } from '../src/mall/service/pay.service'

describe('AppController (e2e)', () => {
  let app
  const userService = {
    charge: () => PointResult,
    getPoint: () => PointResult,
  }
  const productService = {
    getDetail: () => ProductDetailResult,
    getRankedProducts: () => ProductsResult,
  }
  const payService = {
    pay: () => SimpleResult,
  }
  const orderService = {
    order: () => SimpleResult,
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .overrideProvider(ProductService)
      .useValue(productService)
      .overrideProvider(PayService)
      .useValue(payService)
      .overrideProvider(OrderService)
      .useValue(orderService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('should concurrently send requests', async () => {
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app.getHttpServer())
          .patch('/user/charge/:id')
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
