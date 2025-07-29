import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductRepository } from './entities/product.entity';

@Module({
  imports:[
    SequelizeModule.forFeature([ProductRepository])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
