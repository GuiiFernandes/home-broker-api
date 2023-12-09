import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  //ES 7 Decorator JS
  imports: [PrismaModule, AssetsModule, WalletsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
