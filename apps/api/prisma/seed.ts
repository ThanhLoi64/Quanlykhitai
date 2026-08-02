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
    },
  });

  console.log('✅ Admin created');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });