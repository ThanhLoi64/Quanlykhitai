import { ApiProperty } from '@nestjs/swagger';

export class CreateRepairDto {
  @ApiProperty({ description: 'Mã chi tiết kho cần sửa chữa' })
  productDetailId!: number;

  @ApiProperty({ required: false, description: 'Tình trạng hỏng' })
  damageStatus?: string;

  @ApiProperty({ required: false, description: 'Nguyên nhân hỏng' })
  cause?: string;

  @ApiProperty({ required: false, type: String, format: 'date', description: 'Ngày đi sửa chữa' })
  repairStartDate?: Date;

  @ApiProperty({ required: false, description: 'Mức độ' })
  severity?: string;

  @ApiProperty({ required: false, description: 'Đơn vị / người nhận sửa chữa' })
  repairUnit?: string;

  @ApiProperty({ required: false, type: String, format: 'date', description: 'Ngày nhận về' })
  receivedDate?: Date;

  @ApiProperty({ required: false, description: 'Nhận xét tóm tắt' })
  note?: string;
}
