import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  await prisma.tenant.upsert({
    where: { id: 1 },
    update: { name: 'Tenant gốc', parentId: null },
    create: { id: 1, name: 'Tenant gốc' },
  });
  await prisma.tenant.upsert({
    where: { id: 2 },
    update: { name: 'Tenant admin', parentId: 1 },
    create: { id: 2, name: 'Tenant admin', parentId: 1 },
  });
  await prisma.tenant.upsert({
    where: { id: 3 },
    update: { name: 'Tenant staff', parentId: 2 },
    create: { id: 3, name: 'Tenant staff', parentId: 2 },
  });
  await prisma.tenant.upsert({
    where: { id: 4 },
    update: { name: 'Tenant user', parentId: 3 },
    create: { id: 4, name: 'Tenant user', parentId: 3 },
  });

  await prisma.user.upsert({
    where: {
      username: 'sysadmin',
    },
    update: { password: hash, role: UserRole.SYSADMIN, tenantId: 1, isActive: true },
    create: {
      username: 'sysadmin',
      password: hash,
      fullName: 'Administrator',
      role: UserRole.SYSADMIN,
      tenantId: 1,
    },
  });

  await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      password: hash,
      role: UserRole.ADMIN,
      tenantId: 2,
      isActive: true,
    },
    create: {
      username: 'admin',
      password: hash,
      fullName: 'Tai khoan admin',
      role: UserRole.ADMIN,
      tenantId: 2,
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: { password: hash, role: UserRole.STAFF, tenantId: 3, isActive: true },
    create: {
      username: 'staff',
      password: hash,
      fullName: 'Tai khoan staff',
      role: UserRole.STAFF,
      tenantId: 3,
    },
  });

  await prisma.user.upsert({
    where: { username: 'user' },
    update: { password: hash, role: UserRole.USER, tenantId: 4, isActive: true },
    create: {
      username: 'user',
      password: hash,
      fullName: 'Tai khoan user',
      role: UserRole.USER,
      tenantId: 4,
    },
  });

  await prisma.user.deleteMany({ where: { username: 'testuser' } });

  console.log('✅ Seeded accounts: sysadmin, admin, staff, user / 123456');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });