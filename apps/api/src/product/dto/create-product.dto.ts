import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Súng AK',
    description: 'Tên sản phẩm',
  })
  name!: string;

  @ApiProperty({
    example: 'Khẩu',
    description: 'Đơn vị tính',
  })
  unit!: string;

  @ApiPropertyOptional({
    example: 'Loại A',
    description: 'Phân loại',
  })
  classification?: string;

  @ApiPropertyOptional({
    example: 'Kho A - Kệ 01',
    description: 'Vị trí lưu kho',
  })
  storageLocation?: string;

  @ApiPropertyOptional({
    example: 'Hàng mới nhập',
    description: 'Ghi chú',
  })
  note?: string;

  @ApiPropertyOptional({
    example: 'Việt Nam',
    description: 'Xuất xứ sản phẩm',
  })
  origin?: string;

  @ApiPropertyOptional({
    description: 'Lịch sử sử dụng sản phẩm',
  })
  usageHistory?: string;

  @ApiPropertyOptional({
    description: 'Tài liệu liên quan đến sản phẩm',
  })
  documents?: string;

  @ApiProperty({
    example: 1,
    description: 'ID danh mục',
  })
  categoryId!: number;

  image?: string;

  @ApiPropertyOptional({
    description: 'Thông tin chi tiết',
    type: Object,
    example: {
      ownerName: 'Nguyễn Văn A',
      position: 'Tiểu đội trưởng',
      serialNumber: 'AK20250001',
      classification: 'Loại I',
      accessory: 'Băng đạn, dây đeo',
      equipment: 'Ống ngắm',
      militaryEquipment: 'Súng trường AK',
      receivedDate: '2025-01-15',
    },
  })
  detail?: {
    ownerName?: string;

    position?: string;

    serialNumber?: string;

    classification?: string;

    accessory?: string;

    equipment?: string;

    militaryEquipment?: string;

    receivedDate?: Date;
  };
}