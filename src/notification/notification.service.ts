import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/sequelize';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {

  constructor(
    private readonly firebaseService:FirebaseService
  ){ }
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }


  async sendToDevice() {
    let token ="";
    let payload = {
       token:token,
      notification: {
        title: 'Hello!',
        body: 'This is your notification 😊',
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        customData: '123',
      },
    };

    return this.firebaseService.sendToDevice( payload);
  }

 
  async sendToTopic(topic: string, payload:admin.messaging.Message) {
     payload = {
      token:"",
      notification: {
        title: 'Topic Notification',
        body: `Sent to topic ${topic}`,
      },
      data: {
        info: 'topicData',
      },
    };

    return this.firebaseService.sendToTopic( payload);
  }


}
