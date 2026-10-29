import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


constructor(private readonly prisma: PrismaService){

super({

jwtFromRequest:
ExtractJwt.fromAuthHeaderAsBearerToken(),


ignoreExpiration:false,


secretOrKey:'SECRET_KEY_CHANGE_ME',

});

}



async validate(payload: any) {
  const id = payload.userId ?? payload.sub;
  if (!Number.isInteger(id)) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

  return this.prisma.runWithoutTenant(async () => {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        tenantId: true,
        isActive: true,
        expiresAt: true,
        sessionVersion: true,
        mustChangePassword: true,
        lastActivityAt: true,
      },
    });
    if (
      !user ||
      !user.isActive ||
      (user.expiresAt && user.expiresAt <= new Date()) ||
      Number(payload.sessionVersion ?? 0) !== user.sessionVersion
    ) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hiệu lực');
    }

    const activityThreshold = new Date(Date.now() - 60_000);
    if (!user.lastActivityAt || user.lastActivityAt < activityThreshold) {
      await this.prisma.user.updateMany({
        where: {
          id: user.id,
          OR: [
            { lastActivityAt: null },
            { lastActivityAt: { lt: activityThreshold } },
          ],
        },
        data: { lastActivityAt: new Date() },
      });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      mustChangePassword: user.mustChangePassword,
    };
  });
}


}