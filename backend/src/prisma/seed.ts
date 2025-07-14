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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Development',
      description: 'Development of company website',
      status: 'ACTIVE',
      managerId: manager.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      status: 'ACTIVE',
      managerId: manager.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create sample timesheets
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await prisma.timesheet.createMany({
    data: [
      {
        user_id: user.id,
        project_id: project1.id,
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'Frontend development',
        date: yesterday,
        hours_worked: 3.5,
        overtime_hours: 0,
        description: 'Developed React components',
        status: 'submitted',
        billable: true,
        hourly_rate: 1000,
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        user_id: user.id,
        project_id: project2.id,
        work_type: 'PROJECT',
        sub_work_type: 'MEETING',
        activity: 'Team meeting',
        date: now,
        hours_worked: 1.0,
        overtime_hours: 0,
        description: 'Daily standup',
        status: 'draft',
        billable: false,
        hourly_rate: 0,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: manager.id,
        project_id: project2.id,
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'Planning',
        date: now,
        hours_worked: 2.0,
        overtime_hours: 0,
        description: 'Project planning and requirements',
        status: 'approved',
        billable: true,
        hourly_rate: 1200,
        created_at: now,
        updated_at: now,
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