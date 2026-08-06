import { Injectable } from '@nestjs/common';
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
}
