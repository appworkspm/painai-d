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

  // 1. Create roles
  const [adminRole, managerRole, userRole] = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', description: 'System administrator' } }),
    prisma.role.upsert({ where: { name: 'MANAGER' }, update: {}, create: { name: 'MANAGER', description: 'Project manager' } }),
    prisma.role.upsert({ where: { name: 'USER' }, update: {}, create: { name: 'USER', description: 'Regular user' } }),
  ]);

  // 2. Create permissions
  const permissions = [
    { name: 'VIEW_REPORT', description: 'View reports' },
    { name: 'APPROVE_TIMESHEET', description: 'Approve or reject timesheets' },
    { name: 'MANAGE_PROJECT', description: 'Create/update/delete projects' },
    { name: 'MANAGE_TASK', description: 'Create/update/delete project tasks' },
    { name: 'MANAGE_USER', description: 'Manage users and roles' },
  ];
  const permissionRecords = await Promise.all(
    permissions.map(p => prisma.permission.upsert({ where: { name: p.name }, update: {}, create: p }))
  );

  // 3. Assign permissions to roles
  // ADMIN gets all, MANAGER gets some, USER gets only view
  await Promise.all([
    ...permissionRecords.map(pr => prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: pr.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: pr.id },
    })),
    ...permissionRecords.filter(pr => ['VIEW_REPORT', 'APPROVE_TIMESHEET', 'MANAGE_PROJECT', 'MANAGE_TASK'].includes(pr.name)).map(pr => prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: pr.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: pr.id },
    })),
    ...permissionRecords.filter(pr => ['VIEW_REPORT'].includes(pr.name)).map(pr => prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: pr.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: pr.id },
    })),
  ]);

  // 4. Assign user_roles
  await Promise.all([
    prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: manager.id, roleId: managerRole.id } }, update: {}, create: { userId: manager.id, roleId: managerRole.id } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: userRole.id } }, update: {}, create: { userId: user.id, roleId: userRole.id } }),
  ]);

  // 5. Create project tasks
  const task1 = await prisma.projectTask.create({
    data: {
      projectId: project1.id,
      name: 'Design UI',
      description: 'Design user interface for website',
      status: 'IN_PROGRESS',
      assigneeId: user.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 2,
      createdBy: manager.id,
      updatedBy: manager.id,
    },
  });
  const task2 = await prisma.projectTask.create({
    data: {
      projectId: project2.id,
      name: 'Setup CI/CD',
      description: 'Configure CI/CD pipeline',
      status: 'TODO',
      assigneeId: manager.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: 1,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  // 6. Create timesheet edit history ตัวอย่าง
  await prisma.timesheetEditHistory.create({
    data: {
      timesheetId: (await prisma.timesheet.findFirst({ where: { user_id: user.id } }))?.id!,
      userId: user.id,
      action: 'edit',
      oldValue: { hours_worked: 3.0 },
      newValue: { hours_worked: 3.5 },
      createdAt: new Date(),
    },
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