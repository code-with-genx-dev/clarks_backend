import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { UserRepository } from './users/entities/user.entity';
import { ProductRepository } from './products/entities/product.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      SequelizeModule.forRoot({
      dialect: 'mysql', // or postgres, sqlite, etc.
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadModels: true, // Automatically loads models from SequelizeModule.forFeature
      synchronize: true, // Set to false in production!
      logging: false,
    }),
    SequelizeModule.forFeature([UserRepository,ProductRepository]),
     HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
     CacheModule.register({
      isGlobal: true,
      max: 100,
      ttl: 0
    }),
     JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions:{
        expiresIn:process.env.JWT_EXPIRES_IN
      }
     }),
     UsersModule,
     ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
