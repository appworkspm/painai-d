const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTimesheetData() {
  try {
    console.log('🔍 Checking timesheet data...\n');

    // Get all timesheets
    const timesheets = await prisma.timesheet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Total timesheets found: ${timesheets.length}\n`);

    // Calculate stats
    let totalHours = 0;
    let stats = {
      total: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      totalHours: 0
    };

    timesheets.forEach((timesheet, index) => {
      console.log(`📝 Timesheet ${index + 1}:`);
      console.log(`   ID: ${timesheet.id}`);
      console.log(`   User: ${timesheet.user?.name} (${timesheet.user?.email})`);
      console.log(`   Project: ${timesheet.project?.name || 'N/A'}`);
      console.log(`   Date: ${timesheet.date}`);
      console.log(`   Work Type: ${timesheet.work_type}`);
      console.log(`   Sub Work Type: ${timesheet.sub_work_type}`);
      console.log(`   Activity: ${timesheet.activity}`);
      console.log(`   Hours Worked: ${timesheet.hours_worked}`);
      console.log(`   Overtime Hours: ${timesheet.overtime_hours || 0}`);
      console.log(`   Status: ${timesheet.status}`);
      console.log(`   Total Hours: ${timesheet.hours_worked + (timesheet.overtime_hours || 0)}`);
      console.log('');

      // Update stats
      stats.total++;
      stats[timesheet.status]++;
      const recordTotalHours = timesheet.hours_worked + (timesheet.overtime_hours || 0);
      stats.totalHours += recordTotalHours;
      totalHours += recordTotalHours;
    });

    console.log('📈 Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Draft: ${stats.draft}`);
    console.log(`   Submitted: ${stats.submitted}`);
    console.log(`   Approved: ${stats.approved}`);
    console.log(`   Rejected: ${stats.rejected}`);
    console.log(`   Total Hours: ${stats.totalHours}`);
    console.log(`   Calculated Total Hours: ${totalHours}`);

    // Check for any unusual values
    const unusualHours = timesheets.filter(t => t.hours_worked > 24 || t.hours_worked < 0);
    if (unusualHours.length > 0) {
      console.log('\n⚠️  Unusual hours found:');
      unusualHours.forEach(t => {
        console.log(`   ID: ${t.id}, Hours: ${t.hours_worked}, User: ${t.user?.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking timesheet data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTimesheetData(); 