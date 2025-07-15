const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetTimesheetData() {
  try {
    console.log('🔄 Resetting timesheet data...\n');

    // Delete related data first
    console.log('🗑️  Deleting related data...');
    await prisma.timesheetEditHistory.deleteMany({});
    console.log('✅ TimesheetEditHistory deleted');
    
    // Delete all timesheets
    console.log('🗑️  Deleting all timesheets...');
    await prisma.timesheet.deleteMany({});
    console.log('✅ All timesheets deleted\n');

    // Get users and projects
    const users = await prisma.user.findMany();
    const projects = await prisma.project.findMany();

    console.log(`👥 Found ${users.length} users`);
    console.log(`📋 Found ${projects.length} projects\n`);

    // Create new timesheets with correct data
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newTimesheets = [
      {
        user_id: users.find(u => u.email === 'user@painai.com')?.id,
        project_id: projects.find(p => p.name === 'Website Development')?.id,
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
        user_id: users.find(u => u.email === 'user@painai.com')?.id,
        project_id: projects.find(p => p.name === 'Mobile App')?.id,
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
        user_id: users.find(u => u.email === 'manager@painai.com')?.id,
        project_id: projects.find(p => p.name === 'Mobile App')?.id,
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
    ];

    console.log('📝 Creating new timesheets...');
    for (const timesheetData of newTimesheets) {
      if (timesheetData.user_id && timesheetData.project_id) {
        await prisma.timesheet.create({
          data: timesheetData
        });
        console.log(`✅ Created timesheet for ${timesheetData.activity}`);
      }
    }

    // Verify the new data
    console.log('\n🔍 Verifying new data...\n');
    const newTimesheetsList = await prisma.timesheet.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    let totalHours = 0;
    newTimesheetsList.forEach((timesheet, index) => {
      const hoursWorked = Number(timesheet.hours_worked || 0);
      const overtimeHours = Number(timesheet.overtime_hours || 0);
      const recordTotalHours = hoursWorked + overtimeHours;
      totalHours += recordTotalHours;
      
      console.log(`📝 Timesheet ${index + 1}:`);
      console.log(`   User: ${timesheet.user?.name}`);
      console.log(`   Project: ${timesheet.project?.name}`);
      console.log(`   Activity: ${timesheet.activity}`);
      console.log(`   Hours Worked: ${hoursWorked}`);
      console.log(`   Overtime Hours: ${overtimeHours}`);
      console.log(`   Total Hours: ${recordTotalHours}`);
      console.log(`   Status: ${timesheet.status}`);
      console.log('');
    });

    console.log(`📈 Total Hours: ${totalHours}`);

  } catch (error) {
    console.error('❌ Error resetting timesheet data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTimesheetData(); 