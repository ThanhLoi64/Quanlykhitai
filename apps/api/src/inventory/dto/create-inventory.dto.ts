import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({
    example: 1,
    description: 'ID của sản phẩm',
  })
  productId!: number;

  @ApiProperty({
    example: 2,
    description: 'ID của kho',
  })
  warehouseId!: number;

  @ApiProperty({
    example: 'AK20250001',
    description: 'Số serial của sản phẩm',
  })
  serialNumber!: string;

  @ApiPropertyOptional({
    example: ['AK20250001', 'AK20250002', 'AK20250003'],
    description: 'Danh sách số hiệu khi nhập nhiều khí tài cùng lúc',
    type: [String],
  })
  serialNumbers?: string[];

  @ApiPropertyOptional({
    example: 3,
    description: 'Số lượng khí tài cần nhập',
  })
  quantity?: number;

  @ApiPropertyOptional({
    example: '01 băng đạn, dây đeo',
    description: 'Phụ kiện đi kèm',
  })
  accessory?: string;

  @ApiPropertyOptional({
    example: 'Ống ngắm quang học',
    description: 'Trang thiết bị đi kèm',
  })
  equipment?: string;

  @ApiPropertyOptional({
    example: 'Súng trường AK',
    description: 'Loại trang bị quân sự',
  })
  militaryEquipment?: string;

  @ApiPropertyOptional({
    example: 'LENH-2026-001',
    description: 'Số lệnh nhập kho',
  })
  importOrder?: string;

  @ApiPropertyOptional({
    example: 'IN_STOCK',
    description: 'Trạng thái hiện tại của khí tài',
  })
  status?: string;
}