import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  //ES 7 Decorator JS
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
