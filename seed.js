const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@event.com' },
    update: {},
    create: {
      email: 'admin@event.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'Super admin'
    }
  });
  console.log('Seeded admin user');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
