import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { IProductRepository } from './mall.interface'
import { ProductResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { ProductEntity, SalesEntity } from '../models/Entities'
import { ProductItem, Product } from '../models/Product'

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(SalesEntity)
    private readonly sales: Repository<SalesEntity>,
  ) {}

  async getProduct(id: number): Promise<ProductResult> {
    return this.products
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, product: o }
      })
      .catch(e => {
        console.log(e)
        return { errorcode: Errorcode.InvalidRequest }
      })
  }

  async updateSales(date: Date, products: ProductItem[]): Promise<void> {
    const day = date.toISOString().split('T')[0]
    const curSales = await this.sales.find({
      where: {
        date: day,
      },
    })

    for (const p of products) {
      const prev = curSales.find(v => v.id === p.id)
      if (prev) {
        prev.quantity += p.quantity
        // fixme : check save is update
        await this.sales.save(prev)
      } else {
        const newSale = this.sales.create({
          date: day,
          id: p.id,
          quantity: p.quantity,
        })
        await this.sales.save(newSale)
      }
    }
  }

  async getSales(time: Date, period: number, top: number): Promise<Product[]> {
    const dates = []
    for (let i = 0; i < period; i++) {
      const currentDate = new Date(time)
      currentDate.setDate(time.getDate() - i)
      const formattedDate = currentDate.toISOString().split('T')[0]
      dates.push(formattedDate)
    }

    const filtered = await this.sales.find({
      where: {
        date: In(dates),
      },
    })

    const quantityById = new Map<number, number>()
    filtered.forEach(sale => {
      const id = sale.id
      const quantity = sale.quantity
      if (quantityById.has(id)) {
        quantityById.set(id, quantityById.get(id)! + quantity)
      } else {
        quantityById.set(id, quantity)
      }
    })

    const sortedByQuantityDesc = Array.from(quantityById.entries()).sort(
      (a, b) => b[1] - a[1],
    )

    const topResults = sortedByQuantityDesc.slice(0, top)
    return await Promise.all(
      topResults.map(async ([id]) => {
        const product = await this.products.findOne({
          where: { id: id },
        })
        return {
          id: product.id,
          name: product.name,
          price: product.price,
        }
      }),
    )
  }
}
