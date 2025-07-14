import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@painai.com' },
    update: {},
    create: {
      email: 'admin@painai.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerPassword = await hashPassword('manager123');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@painai.com' },
    update: {},
    create: {
      email: 'manager@painai.com',
      password: managerPassword,
      name: 'Project Manager',
      role: 'MANAGER',
    },
  });

  // Create regular user
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@painai.com' },
    update: {},
    create: {
      email: 'user@painai.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      name: 'Website Development',
      description: 'Development of company website',
      status: 'ACTIVE',
      managerId: manager.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'project-2' },
    update: {},
    create: {
      id: 'project-2',
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      status: 'ACTIVE',
      managerId: manager.id,
    },
  });

  // Create sample timesheets
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await prisma.timesheet.createMany({
    data: [
      {
        userId: user.id,
        projectId: project1.id,
        activityType: 'PROJECT_WORK',
        description: 'Frontend development - React components',
        startTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endTime: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        duration: 180, // 3 hours
      },
      {
        userId: user.id,
        activityType: 'MEETING',
        description: 'Team standup meeting',
        startTime: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000), // 1 PM
        endTime: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000 + 30 * 60 * 1000), // 1:30 PM
        duration: 30,
      },
      {
        userId: user.id,
        projectId: project1.id,
        activityType: 'PROJECT_WORK',
        description: 'Backend API integration',
        startTime: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        duration: 180,
      },
      {
        userId: manager.id,
        projectId: project2.id,
        activityType: 'PROJECT_WORK',
        description: 'Project planning and requirements analysis',
        startTime: new Date(now.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        endTime: new Date(now.getTime() + 11 * 60 * 60 * 1000), // 11 AM today
        duration: 120,
      },
      {
        userId: manager.id,
        activityType: 'NON_PROJECT_WORK',
        description: 'Email correspondence and documentation',
        startTime: new Date(now.getTime() + 11 * 60 * 60 * 1000), // 11 AM today
        endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 PM today
        duration: 60,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log('👥 Users created:');
  console.log(`  - Admin: admin@painai.com (password: admin123)`);
  console.log(`  - Manager: manager@painai.com (password: manager123)`);
  console.log(`  - User: user@painai.com (password: user123)`);
  console.log('📊 Sample projects and timesheets created');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 