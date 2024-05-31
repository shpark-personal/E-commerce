import { todo } from 'node:test'
import {
  IOrderRepository,
  IProductRepository,
  IStockRepository,
  IUserRepository,
} from '../repository/mall.interface'
import { PayService } from './pay.service'
import { OrderEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { PointResult } from '../models/Result'

describe('PayService', () => {
  let payService: PayService
  let userRepositoryMock: IUserRepository
  let productRepositoryMock: IProductRepository
  let stockRepositoryMock: IStockRepository
  let orderRepositoryMock: IOrderRepository

  beforeEach(() => {
    userRepositoryMock = {
      charge: jest.fn(),
      get: jest.fn(),
      use: jest.fn(),
    }
    productRepositoryMock = {
      getProduct: jest.fn(),
      updateSales: jest.fn(),
      getSales: jest.fn(),
    }
    stockRepositoryMock = {
      getStock: jest.fn(),
      enoughStock: jest.fn(),
      keepStock: jest.fn(),
      restoreStock: jest.fn(),
      depleteStock: jest.fn(),
    }
    orderRepositoryMock = {
      createOrder: jest.fn(),
      deleteOrder: jest.fn(),
      createPayment: jest.fn(),
      getOrder: jest.fn(),
    }
    payService = new PayService(
      userRepositoryMock,
      productRepositoryMock,
      stockRepositoryMock,
      orderRepositoryMock,
    )
  })

  describe('pay', () => {
    it('success to pay', async () => {
      const userId = 'user123'
      const date = new Date()
      const orderForm: OrderEntity = {
        id: `${date}`,
        userId: userId,
        products: [],
        payment: 50,
        createTime: date,
      }
      orderForm.products = [
        { id: 1, quantity: 1, order: orderForm },
        { id: 2, quantity: 1, order: orderForm },
      ]
      const pointResult: PointResult = {
        errorcode: Errorcode.Success,
        point: 10,
      }

      jest.spyOn(orderRepositoryMock, 'getOrder').mockResolvedValue(orderForm)
      jest.spyOn(userRepositoryMock, 'use').mockResolvedValue(pointResult)
      jest.spyOn(stockRepositoryMock, 'depleteStock')
      jest.spyOn(orderRepositoryMock, 'createPayment')
      jest.spyOn(productRepositoryMock, 'updateSales')

      const result = await payService.pay(userId, orderForm.id)
      expect(result).toEqual({ errorcode: Errorcode.Success })
    })
  })

  // 재고 복구 여부, order 삭제 확인
  todo('valid id check')
  todo('orderForm이 없을 때')
  todo('point use 실패했을 때')

  // db관련 실패
  todo('depleteStock 실패')
  todo('payment create 실패')
  todo('updateSale 실패')
})
