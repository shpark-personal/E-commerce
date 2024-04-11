import { Module } from '@nestjs/common'
import { MallModule } from './mall/module/mall.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeormConfig } from './mall/typeorm.config'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize()
      },
    }),
    MallModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
