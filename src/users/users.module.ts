import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRepository } from './entities/user.entity';
import { JwtService} from '@nestjs/jwt'

@Module({
  imports: [SequelizeModule.forFeature([UserRepository])],
  controllers: [UsersController],
  providers: [UsersService,JwtService],
})
export class UsersModule {}
