import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty({
    example: 1,
    description: 'ID của chủ sở hữu',
  })
  ownerId!: number;

  @ApiProperty({
    example: 10,
    description: 'ID của thông tin chi tiết',
  })
  detailId!: number;

  @ApiProperty({
    example: 'Cán thông nòng, Lê súng',
    description: 'Danh sách phụ tùng',
    required: false,
  })
  accessory?: string;

  @ApiProperty({
    example: 'Dây súng, Bao xe',
    description: 'Danh sách trang bị',
    required: false,
  })
  equipment?: string;

  @ApiProperty({
    example: 'Cuốc to, Xẻng nhỏ',
    description: 'Danh sách quân cụ',
    required: false,
  })
  militaryEquipment?: string;
}