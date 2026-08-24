import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ example: 12 })
  productDetailId!: number;

  @ApiProperty({ example: 5 })
  toWarehouseId!: number;
}