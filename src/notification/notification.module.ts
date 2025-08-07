import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationRepository } from './enum/notification.entity';
import { FirebaseService } from 'src/firebase/firebase.service';


@Module({
  imports:[
        SequelizeModule.forFeature([NotificationRepository])
  ],
  controllers: [NotificationController],
  providers: [NotificationService,FirebaseService],
})
export class NotificationModule {}
