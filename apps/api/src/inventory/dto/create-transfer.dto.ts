import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiPropertyOptional({ example: 12 })
  productDetailId?: number;

  @ApiPropertyOptional({ example: 3 })
  ammunitionId?: number;

  @ApiPropertyOptional({ example: 100 })
  quantity?: number;

  @ApiProperty({ example: 5 })
  toWarehouseId!: number;

  @ApiProperty({ example: 20 })
  toUserId!: number;

  @ApiProperty({ example: 2 })
  approvalUserId!: number;
}