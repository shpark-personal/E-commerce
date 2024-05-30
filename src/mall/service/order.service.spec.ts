import { OrderService } from './order.service'
import {
  IOrderRepository,
  IProductRepository,
  IStockRepository,
} from '../repository/mall.interface'
import { Errorcode } from '../models/Enums'
import { Product, ProductItem } from '../models/Product'
import { todo } from 'node:test'
import { OrderEntity } from '../models/Entities'

describe('OrderService', () => {
  let orderService: OrderService
  let productRepositoryMock: IProductRepository
  let stockRepositoryMock: IStockRepository
  let orderRepositoryMock: IOrderRepository

  beforeEach(() => {
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
    orderService = new OrderService(
      productRepositoryMock,
      stockRepositoryMock,
      orderRepositoryMock,
    )
  })

  describe('order', () => {
    // 재고가 충분하여 주문 가능하다
    it('success', async () => {
      const userId = 'user123'
      const product1: Product = {
        id: 1,
        name: 'product1',
        price: 1000,
      }
      const product2: Product = {
        id: 2,
        name: 'product2',
        price: 1000,
      }
      const pi1: ProductItem = {
        id: 1,
        quantity: 1,
      }
      const pi2: ProductItem = {
        id: 2,
        quantity: 1,
      }

      jest.spyOn(stockRepositoryMock, 'enoughStock').mockResolvedValue(true)
      jest
        .spyOn(productRepositoryMock, 'getProduct')
        .mockImplementation((id: number) => {
          if (id === 1) {
            return Promise.resolve(product1)
          } else if (id === 2) {
            return Promise.resolve(product2)
          } else {
            return Promise.resolve(null)
          }
        })

      const date = new Date()
      const orderForm: OrderEntity = {
        id: `${date}`,
        userId: userId,
        products: [],
        payment: product1.price * pi1.quantity + product2.price * pi2.quantity,
        createTime: date,
      }
      orderForm.products = [
        { id: 1, quantity: 1, order: orderForm },
        { id: 2, quantity: 1, order: orderForm },
      ]
      // jest.spyOn(stockRepositoryMock, 'keepStock')

      const result = await orderService.order(userId, [pi1, pi2])
      expect(result).toEqual({ errorcode: Errorcode.Success })
      expect(stockRepositoryMock.enoughStock).toHaveBeenCalled()
      expect(productRepositoryMock.getProduct).toHaveBeenCalled()
      expect(stockRepositoryMock.keepStock).toHaveBeenCalled()
      expect(orderRepositoryMock.createOrder).toHaveBeenCalled()
      // expect(stockRepositoryMock.keepStock).toHaveBeenCalledWith(orderForm)
      // expect(orderRepositoryMock.createOrder).toHaveBeenCalledWith(orderForm)
    })

    todo('valid id check')
    todo('out of stock')
    // valid id check
  })
})
