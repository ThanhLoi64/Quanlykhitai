import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Tên đăng nhập',
  })
  username!: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu',
  })
  password!: string;
}