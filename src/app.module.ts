import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
     SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'clarks_demo',
      models: [], // models will be added in their modules
      autoLoadModels: true,
      synchronize: true, // WARNING: only use in dev
    }),AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
