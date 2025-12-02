/**
 * Migration script to convert existing data to SaaS model
 * This script creates a default user and assigns all existing data to that user
 * Run this once before deploying the SaaS version
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SaaS migration...');

  // Create a default migration user
  const defaultEmail = 'migration@abideguide.com';
  const defaultPassword = await bcrypt.hash('ChangeMe123!', 10);

  let defaultUser = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        email: defaultEmail,
        password: defaultPassword,
        name: 'Migration User',
      },
    });
    console.log('Created default migration user:', defaultUser.id);
  } else {
    console.log('Default migration user already exists:', defaultUser.id);
  }

  // Update all guides
  const guidesUpdated = await prisma.$executeRaw`
    UPDATE guides SET user_id = ${defaultUser.id} WHERE user_id IS NULL
  `;
  console.log(`Updated ${guidesUpdated} guides`);

  // Update all studies
  const studiesUpdated = await prisma.$executeRaw`
    UPDATE studies SET user_id = ${defaultUser.id} WHERE user_id IS NULL
  `;
  console.log(`Updated ${studiesUpdated} studies`);

  // Update all sessions
  const sessionsUpdated = await prisma.$executeRaw`
    UPDATE sessions SET user_id = ${defaultUser.id} WHERE user_id IS NULL
  `;
  console.log(`Updated ${sessionsUpdated} sessions`);

  // Update all resources
  const resourcesUpdated = await prisma.$executeRaw`
    UPDATE resources SET user_id = ${defaultUser.id} WHERE user_id IS NULL
  `;
  console.log(`Updated ${resourcesUpdated} resources`);

  // Update all schedules
  const schedulesUpdated = await prisma.$executeRaw`
    UPDATE schedules SET user_id = ${defaultUser.id} WHERE user_id IS NULL
  `;
  console.log(`Updated ${schedulesUpdated} schedules`);

  console.log('Migration completed!');
  console.log('⚠️  IMPORTANT: Change the password for the migration user!');
  console.log(`   Email: ${defaultEmail}`);
  console.log(`   Temporary password: ChangeMe123!`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
