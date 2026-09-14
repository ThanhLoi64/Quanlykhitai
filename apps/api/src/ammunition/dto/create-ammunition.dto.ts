import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmmunitionDto {
  @ApiProperty({ example: 12, description: 'ID loại đạn trong danh sách sản phẩm' })
  productId!: number;

  @ApiPropertyOptional({ example: 3, description: 'ID đầu mối nhập kho' })
  warehouseId?: number;

  @ApiProperty({ example: 'LÔ-2026-01', description: 'Số lô đạn' })
  batch!: string;

  @ApiProperty({ example: 'Viên', description: 'Đơn vị tính' })
  unit!: string;

  @ApiProperty({ example: 500, description: 'Số lượng đạn' })
  quantity!: number;

  @ApiProperty({ example: 2026, description: 'Năm sản xuất' })
  productionYear!: number;
}
