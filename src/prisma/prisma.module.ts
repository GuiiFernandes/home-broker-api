import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Global() //deixa o módulo global para que possa ser usado por todos os outros módulos
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
// Esse Global é usado especificamente para o PrismaModule porque ele é usado por todos os outros módulos e não precisa ser importado por eles, então ele é global.
// Geralmente não é uma boa prática deixar os módulos globais, pois queremos que sejam acessados apenas por quem deve, mas nesse caso é necessário.
