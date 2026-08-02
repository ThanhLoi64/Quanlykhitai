import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Vũ khí',
    description: 'Tên danh mục',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Danh mục quản lý các loại vũ khí',
    description: 'Mô tả danh mục',
  })
  description?: string;
}