const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTimesheetData() {
  try {
    console.log('🔧 Fixing timesheet data...\n');

    // Get all timesheets
    const timesheets = await prisma.timesheet.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Found ${timesheets.length} timesheets\n`);

    // Fix corrupted data
    for (const timesheet of timesheets) {
      let needsUpdate = false;
      let newHoursWorked = timesheet.hours_worked;

      // Check for corrupted hours_worked values
      if (timesheet.hours_worked > 24 || timesheet.hours_worked < 0) {
        console.log(`⚠️  Found corrupted hours_worked: ${timesheet.hours_worked} for timesheet ${timesheet.id}`);
        
        // Set reasonable default values based on activity
        if (timesheet.activity === 'CODE_DEVELOPMENT' || timesheet.activity === 'Frontend development') {
          newHoursWorked = 8;
        } else if (timesheet.activity === 'Team meeting' || timesheet.activity === 'Planning') {
          newHoursWorked = 1;
        } else {
          newHoursWorked = 4; // Default value
        }
        
        needsUpdate = true;
      }

      // Update if needed
      if (needsUpdate) {
        await prisma.timesheet.update({
          where: { id: timesheet.id },
          data: {
            hours_worked: newHoursWorked,
            updated_at: new Date()
          }
        });
        
        console.log(`✅ Fixed timesheet ${timesheet.id}: ${timesheet.hours_worked} → ${newHoursWorked}`);
      }
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...\n');
    const fixedTimesheets = await prisma.timesheet.findMany({
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
    fixedTimesheets.forEach((timesheet, index) => {
      const recordTotalHours = timesheet.hours_worked + (timesheet.overtime_hours || 0);
      totalHours += recordTotalHours;
      
      console.log(`📝 Timesheet ${index + 1}:`);
      console.log(`   User: ${timesheet.user?.name}`);
      console.log(`   Project: ${timesheet.project?.name}`);
      console.log(`   Activity: ${timesheet.activity}`);
      console.log(`   Hours Worked: ${timesheet.hours_worked}`);
      console.log(`   Overtime Hours: ${timesheet.overtime_hours || 0}`);
      console.log(`   Total Hours: ${recordTotalHours}`);
      console.log('');
    });

    console.log(`📈 Total Hours: ${totalHours}`);

  } catch (error) {
    console.error('❌ Error fixing timesheet data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimesheetData(); 