import { OrderType } from '@prisma/client';

//DTO - Data Transfer Object
export class InitTransactionDto {
  asset_id: string;
  wallet_id: string;
  shares: number;
  type: OrderType;
  price: number;
}
// com o DTO, podemos definir o tipo de cada propriedade e validar os dados com duas bibliotecas: class-validator e class-transformer
// class-validator - valida os dados de entrada
// class-transformer - transforma os dados de entrada em objetos do tipo DTO
