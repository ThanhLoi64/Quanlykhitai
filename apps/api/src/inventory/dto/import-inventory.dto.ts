import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImportInventoryItemDto {
  @ApiPropertyOptional({ example: 1, description: 'ID của sản phẩm nếu đã có sẵn' })
  productId?: number;

  @ApiPropertyOptional({ example: 'AK-74', description: 'Tên sản phẩm từ file Excel' })
  productName?: string;

  @ApiPropertyOptional({ example: 2, description: 'ID của kho nếu đã có sẵn' })
  warehouseId?: number;

  @ApiPropertyOptional({ example: 'Kho A', description: 'Tên kho từ file Excel' })
  warehouseName?: string;

  @ApiPropertyOptional({ example: 'AK20250001', description: 'Số serial của sản phẩm' })
  serialNumber?: string;

  @ApiPropertyOptional({ example: '01 băng đạn, dây đeo', description: 'Phụ kiện đi kèm' })
  accessory?: string;

  @ApiPropertyOptional({ example: 'Ống ngắm quang học', description: 'Trang thiết bị đi kèm' })
  equipment?: string;

  @ApiPropertyOptional({ example: 'Súng trường AK', description: 'Loại trang bị quân sự' })
  militaryEquipment?: string;

  @ApiPropertyOptional({ example: 'LENH-2026-001', description: 'Số lệnh nhập kho' })
  importOrder?: string;

  @ApiPropertyOptional({ example: 'IN_STOCK', description: 'Trạng thái hiện tại của khí tài' })
  status?: string;
}
