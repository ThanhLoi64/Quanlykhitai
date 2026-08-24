import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {


constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
){}



async login(
  username: string,
  password: string,
) {

  const user = await this.prisma.user.findUnique({
    where: {
      username,
    },
  });


  if (!user) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu'
    );
  }


  const checkPassword = await bcrypt.compare(
    password,
    user.password,
  );


  if (!checkPassword) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu'
    );
  }


  // dữ liệu đưa vào token
  const payload = {
    sub: user.id,
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: user.tenantId,
  };


  // tạo JWT
  const accessToken =
    await this.jwtService.signAsync(payload);



  return {

    accessToken,


    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    },

  };

}



}