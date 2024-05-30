import { Errorcode } from '../models/Enums'
import {
  IProductRepository,
  IStockRepository,
} from '../repository/mall.interface'
import { ProductService } from './product.service'
import { Product } from '../models/Product'
import {
  ProductResult,
  StockResult,
  ProductDetailResult,
  ProductsResult,
} from '../models/Result'
import { todo } from 'node:test'

describe('ProductService', () => {
  let productService: ProductService
  let productRepositoryMock: IProductRepository
  let stockRepositoryMock: IStockRepository

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
    productService = new ProductService(
      productRepositoryMock,
      stockRepositoryMock,
    )
  })

  describe('getDetail', () => {
    it('should get details', async () => {
      const productId = 'productA'
      const quantity = 50
      const product: Product = {
        id: 1,
        name: productId,
        price: 1000,
      }
      const productResult: ProductResult = {
        errorcode: Errorcode.Success,
        product: product,
      }
      const stockResult: StockResult = {
        errorcode: Errorcode.Success,
        quantity: quantity,
      }
      const detailResult: ProductDetailResult = {
        errorcode: Errorcode.Success,
        product: product,
        quantity: quantity,
      }

      jest
        .spyOn(productRepositoryMock, 'getProduct')
        .mockResolvedValue(productResult)
      jest.spyOn(stockRepositoryMock, 'getStock').mockResolvedValue(stockResult)

      const result = await productService.getDetail(product.id)

      expect(result).toEqual(detailResult)
      expect(productRepositoryMock.getProduct).toHaveBeenCalledWith(product.id)
      expect(stockRepositoryMock.getStock).toHaveBeenCalledWith(product.id)
    })
  })

  describe('getRankedProducts', () => {
    it('shoud get ranked products', async () => {
      const time = new Date()
      const period = 3
      const top = 2
      const product1: Product = {
        id: 1,
        name: 'product1',
        price: 1000,
      }
      const product2: Product = {
        id: 1,
        name: 'product2',
        price: 1000,
      }

      const productsResult: ProductsResult = {
        products: [product1, product2],
      }

      jest
        .spyOn(productRepositoryMock, 'getSales')
        .mockResolvedValue([product1, product2])

      const result = await productService.getRankedProducts(time, period, top)

      expect(result).toEqual(productsResult)
      expect(productRepositoryMock.getSales).toHaveBeenCalledWith(
        time,
        period,
        top,
      )
    })

    todo('top 수가 부족할 때')
    todo('period invalid')
    todo('time invalid')
  })
})
