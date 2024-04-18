import { Repository } from 'typeorm'
import { StockEntity, RemainStockEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { StockRepository } from './stock.repository'

describe('stockRepositoryTest', () => {
  const mockStockRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  }

  const mockRemainStockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  }

  const repository = new StockRepository(
    mockStockRepository as unknown as Repository<StockEntity>,
    mockRemainStockRepository as unknown as Repository<RemainStockEntity>,
  )

  describe('getStock', () => {
    it('success to get order form', async () => {
      const stock: StockEntity = {
        id: 1,
        quantity: 10,
      }
      jest.spyOn(repository['stocks'], 'findOne').mockResolvedValue(stock)

      expect(await repository.getStock(stock.id)).toEqual({
        errorcode: Errorcode.Success,
        product: stock.quantity,
      })
    })
  })
})
