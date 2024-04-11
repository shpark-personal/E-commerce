import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IProductRepository } from './mall.interface'
import { ProductResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { ProductEntity } from '../models/Entities'

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
  ) {}

  async getDetail(id: number): Promise<ProductResult> {
    this.products
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, product: o }
      })
    return { errorcode: Errorcode.InvalidRequest }
  }
}
