import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as moment from 'moment-timezone';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const port = 5000;
  const timezone = 'Asia/Kolkata'; // India timezone
  moment.tz.setDefault(timezone);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/public/uploads', express.static('public/uploads'));
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  app.enableCors();
  await app.listen(port, () => console.log(`app listening on port ${port}!`));
}
bootstrap();
