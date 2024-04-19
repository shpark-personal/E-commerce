import { Repository } from 'typeorm'
import { OrderEntity, PaymentEntity } from '../models/Entities'
import { ProductItem } from '../models/Product'
import { OrderRepository } from './order.repository'

describe('orderRepositoryTest', () => {
  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  }

  const mockPaymentRepository = {
    save: jest.fn(),
  }

  const repository = new OrderRepository(
    mockOrderRepository as unknown as Repository<OrderEntity>,
    mockPaymentRepository as unknown as Repository<PaymentEntity>,
  )

  describe('create', () => {
    const order: OrderEntity = {
      id: 'o1',
      userId: 'userA',
      products: [{ id: 1, quantity: 3 } as ProductItem],
      payment: 30,
      createTime: new Date(),
    }

    it('success to create order form', async () => {
      jest.spyOn(repository['orders'], 'save').mockResolvedValue(order)

      expect(repository.create(order))
      expect(repository['orders'].save).toHaveBeenCalledWith(order)
    })
  })

  describe('createPayment', () => {
    const payment: PaymentEntity = {
      id: 'p1',
      userId: 'userA',
      orderId: 'o1',
      createTime: new Date(),
    }

    it('success to create order form', async () => {
      jest.spyOn(repository['payments'], 'save').mockResolvedValue(payment)

      expect(await repository.createPayment(payment))
      expect(repository['payments'].save).toHaveBeenCalledWith(payment)
    })
  })

  describe('getOrder', () => {
    const order: OrderEntity = {
      id: 'o1',
      userId: 'userA',
      products: [{ id: 1, quantity: 3 } as ProductItem],
      payment: 30,
      createTime: new Date(),
    }

    it('success to get order form', async () => {
      jest.spyOn(repository['orders'], 'findOne').mockResolvedValue(order)

      expect(repository.getOrder(order.id))
    })
  })
})
