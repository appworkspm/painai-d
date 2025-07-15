const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjectStatuses() {
  try {
    console.log('Checking project statuses...\n');
    
    // Get all projects with their statuses
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        jobCode: true,
        name: true,
        status: true,
        customerName: true
      },
      orderBy: {
        status: 'asc'
      }
    });
    
    console.log(`Total projects found: ${projects.length}\n`);
    
    // Group by status
    const statusGroups = projects.reduce((acc, project) => {
      const status = project.status || 'NO_STATUS';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(project);
      return acc;
    }, {});
    
    console.log('Projects by Status:');
    console.log('='.repeat(80));
    
    Object.keys(statusGroups).forEach(status => {
      const projectsInStatus = statusGroups[status];
      console.log(`\n${status}: ${projectsInStatus.length} projects`);
      console.log('-'.repeat(40));
      
      projectsInStatus.forEach(project => {
        console.log(`  - ${project.jobCode}: ${project.name} (${project.customerName})`);
      });
    });
    
    // Check if all expected statuses exist
    const expectedStatuses = [
      'ACTIVE', 
      'ON_HOLD', 
      'COMPLETED', 
      'CANCELLED', 
      'ESCALATED_TO_SUPPORT', 
      'SIGNED_CONTRACT'
    ];
    
    console.log('\n' + '='.repeat(80));
    console.log('Status Coverage Check:');
    console.log('-'.repeat(40));
    
    expectedStatuses.forEach(status => {
      const count = statusGroups[status] ? statusGroups[status].length : 0;
      console.log(`${status}: ${count} projects`);
    });
    
    // Test filter functionality
    console.log('\n' + '='.repeat(80));
    console.log('Filter Test Results:');
    console.log('-'.repeat(40));
    
    expectedStatuses.forEach(status => {
      const filteredProjects = projects.filter(p => p.status === status);
      console.log(`Filter by ${status}: ${filteredProjects.length} projects`);
    });
    
    // Test search functionality
    console.log('\n' + '='.repeat(80));
    console.log('Search Test Results:');
    console.log('-'.repeat(40));
    
    const searchTerms = ['EXAT', 'DOH', 'TTB', 'ICS'];
    searchTerms.forEach(term => {
      const searchResults = projects.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.customerName.toLowerCase().includes(term.toLowerCase()) ||
        p.jobCode.toLowerCase().includes(term.toLowerCase())
      );
      console.log(`Search for "${term}": ${searchResults.length} projects`);
    });
    
  } catch (error) {
    console.error('Error checking project statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjectStatuses(); 