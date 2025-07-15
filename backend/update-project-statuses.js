const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProjectStatuses() {
  try {
    console.log('Updating project statuses for testing...\n');
    
    // Update some projects with different statuses for testing
    const statusUpdates = [
      {
        jobCode: 'A-2022-EXAT-PJ-049',
        status: 'COMPLETED',
        reason: 'Project completed successfully'
      },
      {
        jobCode: 'A-2023-DOH-PJ-022',
        status: 'ON_HOLD',
        reason: 'Project temporarily on hold'
      },
      {
        jobCode: 'A-2023-ICS-PJ-033',
        status: 'ESCALATED_TO_SUPPORT',
        reason: 'Technical issues escalated'
      },
      {
        jobCode: 'A-2024-TTB-PJ-014',
        status: 'SIGNED_CONTRACT',
        reason: 'Contract signed, ready to start'
      },
      {
        jobCode: 'A-2024-MOAC-PJ-042',
        status: 'CANCELLED',
        reason: 'Project cancelled due to budget constraints'
      }
    ];
    
    for (const update of statusUpdates) {
      const project = await prisma.project.findFirst({
        where: { jobCode: update.jobCode }
      });
      
      if (project) {
        await prisma.project.update({
          where: { id: project.id },
          data: { status: update.status }
        });
        console.log(`✓ Updated ${update.jobCode} to ${update.status} - ${update.reason}`);
      } else {
        console.log(`✗ Project ${update.jobCode} not found`);
      }
    }
    
    console.log('\nStatus update completed!');
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const projects = await prisma.project.findMany({
      select: {
        jobCode: true,
        name: true,
        status: true,
        customerName: true
      },
      orderBy: {
        status: 'asc'
      }
    });
    
    const statusGroups = projects.reduce((acc, project) => {
      const status = project.status || 'NO_STATUS';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(project);
      return acc;
    }, {});
    
    console.log('\nUpdated Project Statuses:');
    console.log('='.repeat(80));
    
    Object.keys(statusGroups).forEach(status => {
      const projectsInStatus = statusGroups[status];
      console.log(`\n${status}: ${projectsInStatus.length} projects`);
      console.log('-'.repeat(40));
      
      projectsInStatus.forEach(project => {
        console.log(`  - ${project.jobCode}: ${project.name} (${project.customerName})`);
      });
    });
    
  } catch (error) {
    console.error('Error updating project statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectStatuses(); 