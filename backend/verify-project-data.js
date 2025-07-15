const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyProjectData() {
  try {
    console.log('Verifying project data...\n');
    
    // Get all projects with their data
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        jobCode: true,
        name: true,
        budget: true,
        customerName: true,
        paymentTerm: true,
        status: true,
        startDate: true,
        endDate: true
      },
      orderBy: {
        jobCode: 'asc'
      }
    });
    
    console.log(`Total projects found: ${projects.length}\n`);
    
    // Display all projects
    console.log('All Projects:');
    console.log('='.repeat(120));
    console.log('Job Code'.padEnd(25) + 'Customer'.padEnd(12) + 'Budget'.padEnd(15) + 'Payment Term'.padEnd(15) + 'Status'.padEnd(15) + 'Name');
    console.log('='.repeat(120));
    
    projects.forEach(project => {
      const budget = project.budget ? project.budget.toLocaleString() : 'N/A';
      const paymentTerm = project.paymentTerm || 'N/A';
      const customer = project.customerName || 'N/A';
      const status = project.status || 'N/A';
      
      console.log(
        (project.jobCode || 'N/A').padEnd(25) +
        customer.padEnd(12) +
        budget.padEnd(15) +
        paymentTerm.padEnd(15) +
        status.padEnd(15) +
        (project.name || 'N/A')
      );
    });
    
    console.log('\n' + '='.repeat(120));
    
    // Summary statistics
    const projectsWithBudget = projects.filter(p => p.budget !== null);
    const projectsWithCustomer = projects.filter(p => p.customerName !== null);
    const projectsWithPaymentTerm = projects.filter(p => p.paymentTerm !== null);
    
    console.log(`\nSummary:`);
    console.log(`- Projects with budget: ${projectsWithBudget.length}/${projects.length}`);
    console.log(`- Projects with customer: ${projectsWithCustomer.length}/${projects.length}`);
    console.log(`- Projects with payment term: ${projectsWithPaymentTerm.length}/${projects.length}`);
    
    // Group by customer
    const projectsByCustomer = await prisma.project.groupBy({
      by: ['customerName'],
      _count: { customerName: true },
      _sum: { budget: true },
      where: {
        customerName: { not: null }
      }
    });
    
    console.log('\nProjects by Customer:');
    console.log('-'.repeat(50));
    projectsByCustomer.forEach(customer => {
      const totalBudget = customer._sum.budget ? customer._sum.budget.toLocaleString() : 'N/A';
      console.log(`${customer.customerName}: ${customer._count.customerName} projects, Total Budget: ${totalBudget}`);
    });
    
    // Payment terms summary
    const paymentTerms = await prisma.project.groupBy({
      by: ['paymentTerm'],
      _count: { paymentTerm: true },
      where: {
        paymentTerm: { not: null }
      }
    });
    
    console.log('\nPayment Terms Distribution:');
    console.log('-'.repeat(30));
    paymentTerms.forEach(term => {
      console.log(`${term.paymentTerm} months: ${term._count.paymentTerm} projects`);
    });
    
  } catch (error) {
    console.error('Error verifying project data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProjectData(); 