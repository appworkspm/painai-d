const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function purgeAllData() {
  try {
    console.log('🗑️  Starting complete data purge...\n');

    // Get table count before purge
    const beforeCounts = await getTableCounts();
    console.log('📊 Data counts before purge:');
    Object.entries(beforeCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });
    console.log('');

    // Purge all data in correct order (respecting foreign key constraints)
    console.log('🧹 Purging data in order...\n');

    // 1. Delete TimesheetEditHistory first (references Timesheet)
    console.log('1. Deleting TimesheetEditHistory...');
    await prisma.timesheetEditHistory.deleteMany({});
    console.log('   ✅ TimesheetEditHistory purged');

    // 2. Delete ActivityLog
    console.log('2. Deleting ActivityLog...');
    await prisma.activityLog.deleteMany({});
    console.log('   ✅ ActivityLog purged');

    // 3. Delete Timesheets (references Project, User, ProjectTask)
    console.log('3. Deleting Timesheets...');
    await prisma.timesheet.deleteMany({});
    console.log('   ✅ Timesheets purged');

    // 4. Delete ProjectTimeline (references Project, User)
    console.log('4. Deleting ProjectTimeline...');
    await prisma.projectTimeline.deleteMany({});
    console.log('   ✅ ProjectTimeline purged');

    // 5. Delete ProjectTeamMember (references Project, User)
    console.log('5. Deleting ProjectTeamMember...');
    await prisma.projectTeamMember.deleteMany({});
    console.log('   ✅ ProjectTeamMember purged');

    // 6. Delete ProjectTask (references Project, User)
    console.log('6. Deleting ProjectTask...');
    await prisma.projectTask.deleteMany({});
    console.log('   ✅ ProjectTask purged');

    // 7. Delete Projects (references User)
    console.log('7. Deleting Projects...');
    await prisma.project.deleteMany({});
    console.log('   ✅ Projects purged');

    // 8. Delete UserRole (references User, Role)
    console.log('8. Deleting UserRole...');
    await prisma.userRole.deleteMany({});
    console.log('   ✅ UserRole purged');

    // 9. Delete RolePermission (references Role, Permission)
    console.log('9. Deleting RolePermission...');
    await prisma.rolePermission.deleteMany({});
    console.log('   ✅ RolePermission purged');

    // 10. Delete Roles
    console.log('10. Deleting Roles...');
    await prisma.role.deleteMany({});
    console.log('   ✅ Roles purged');

    // 11. Delete Permissions
    console.log('11. Deleting Permissions...');
    await prisma.permission.deleteMany({});
    console.log('   ✅ Permissions purged');

    // 12. Delete Users (last, as many tables reference it)
    console.log('12. Deleting Users...');
    await prisma.user.deleteMany({});
    console.log('   ✅ Users purged');

    // Verify all tables are empty
    console.log('\n🔍 Verifying purge results...\n');
    const afterCounts = await getTableCounts();
    
    let allEmpty = true;
    Object.entries(afterCounts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ⚠️  ${table}: ${count} records remaining`);
        allEmpty = false;
      } else {
        console.log(`   ✅ ${table}: ${count} records (empty)`);
      }
    });

    if (allEmpty) {
      console.log('\n🎉 SUCCESS: All data has been purged successfully!');
      console.log('📝 Database structure is preserved and ready for new data.');
    } else {
      console.log('\n⚠️  WARNING: Some tables still contain data.');
    }

    console.log('\n📋 Ready for data migration:');
    console.log('   - Database structure is intact');
    console.log('   - All tables are empty');
    console.log('   - Ready to insert new data');

  } catch (error) {
    console.error('❌ Error during data purge:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function getTableCounts() {
  try {
    const counts = {};
    
    // Count records in each table
    counts.users = await prisma.user.count();
    counts.projects = await prisma.project.count();
    counts.timesheets = await prisma.timesheet.count();
    counts.timesheetEditHistory = await prisma.timesheetEditHistory.count();
    counts.activityLog = await prisma.activityLog.count();
    counts.projectTask = await prisma.projectTask.count();
    counts.projectTeamMember = await prisma.projectTeamMember.count();
    counts.projectTimeline = await prisma.projectTimeline.count();
    counts.role = await prisma.role.count();
    counts.permission = await prisma.permission.count();
    counts.userRole = await prisma.userRole.count();
    counts.rolePermission = await prisma.rolePermission.count();
    
    return counts;
  } catch (error) {
    console.error('Error getting table counts:', error);
    return {};
  }
}

// Run the purge
purgeAllData()
  .then(() => {
    console.log('\n✅ Purge completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Purge failed:', error);
    process.exit(1);
  }); 