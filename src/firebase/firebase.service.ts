// src/firebase/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {

    private defaultApp: admin.app.App;

  constructor() {
    if (!admin.apps.length) {
      this.defaultApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.defaultApp = admin.app(); // use the already initialized app
    }
  }
  

    async sendToDevice(payload: any) {
    try {
      const response = await admin.messaging().send(payload);
      return response;
    } catch (err) {
      console.error('❌ Error sending FCM:', err);
      throw err;
    }
  }

  async sendToTopic( payload: any) {
    try {
      const response = await admin.messaging().send(payload);
      return response;
    } catch (err) {
      console.error('❌ Error sending to topic:', err);
      throw err;
    }
  }
}

