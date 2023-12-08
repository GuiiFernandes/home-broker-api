import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, any>
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect(); //método do prisma que conecta no banco de dados
  }

  async enableShutdownHooks(app: any) {
    //força a quebra da conexão com o banco de dados quando o servidor é desligado ou atualizado
    this.$on('beforeExit', async () => {
      await app.close();
    });
    //sempre que usamos o start:dev, o nestjs reinicia o servidor quando há alterações no código e não usar esse método mantém as conexões antigas com o banco abertas o que pode gerar problemas de uso de recursos desnecessários
  }
}
