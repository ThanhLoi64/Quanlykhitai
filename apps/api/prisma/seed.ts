import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {},
    create: {
      username: 'admin',
      password: hash,
      fullName: 'Administrator',
      role: UserRole.ADMIN,
      tenantId: 1,
    },
  });

  await prisma.user.upsert({
    where: {
      username: 'testuser',
    },
    update: {
      password: hash,
      tenantId: 2,
      isActive: true,
    },
    create: {
      username: 'testuser',
      password: hash,
      fullName: 'Tai khoan test',
      role: UserRole.STAFF,
      tenantId: 2,
    },
  });

  console.log('✅ Admin created');
  console.log('✅ Test account created: testuser / 123456');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });