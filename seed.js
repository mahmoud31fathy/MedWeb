const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. CONFIGURATION: Change the name below to what you want
  const NEW_ADMIN_NAME = "Dr. Mahmoud Fathy"; 
  const ADMIN_EMAIL = "mahmoud31fathy@gmail.com"; // Your email from .env
  
  console.log('--------------------------------------------------');
  console.log('   MEDWEB - SUPER ADMIN NAME UPDATE SCRIPT');
  console.log('--------------------------------------------------');

  // Find the admin and update their name
  const admin = await prisma.admin.update({
    where: { email: ADMIN_EMAIL },
    data: { 
      name: NEW_ADMIN_NAME,
      role: 'Super admin' // Ensure role is correct
    }
  });

  console.log(`✅ SUCCESS!`);
  console.log(`Updated Name: ${admin.name}`);
  console.log(`Admin Email:  ${admin.email}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e.message);
    if (e.code === 'P2025') {
      console.error('Tip: Make sure the email in the script matches the one in the database.');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
