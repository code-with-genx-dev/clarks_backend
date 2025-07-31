import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductRepository } from './entities/product.entity';
import { UserRepository } from 'src/users/entities/user.entity';

@Module({
  imports:[
    SequelizeModule.forFeature([UserRepository,ProductRepository])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
