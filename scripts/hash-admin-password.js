const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash('admin123', 12);
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { passwordHash: hashed },
    });
    console.log('Admin password updated to bcrypt hash.');
  } catch (err) {
    if (err.code === 'P2025') {
      console.log('Admin user not found. Run seed first: npx prisma db seed');
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
