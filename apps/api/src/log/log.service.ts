import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  private formatDetail(detail: unknown): string {
    if (typeof detail === 'string') {
      return detail;
    }

    if (detail == null) {
      return '';
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => this.formatDetail(item))
        .filter(Boolean)
        .join(' | ');
    }

    if (typeof detail === 'object') {
      return Object.entries(detail as Record<string, unknown>)
        .map(([key, value]) => {
          const formattedValue =
            value == null
              ? 'null'
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);

          return `${key}: ${formattedValue}`;
        })
        .join(' | ');
    }

    return String(detail);
  }

  create(user: any, action: string, detail: unknown) {
    return this.prisma.appLog.create({
      data: {
        userId: user?.id ?? null,
        username: user?.username ?? 'unknown',
        action,
        detail: this.formatDetail(detail),
      },
    });
  }

  findAll() {
    return this.prisma.appLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAllWithPassword(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    return this.prisma.appLog.deleteMany({});
  }
}
