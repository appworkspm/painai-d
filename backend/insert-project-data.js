const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const projectData = [
  {
    jobCode: 'A-2022-EXAT-PJ-049',
    budget: 119523364.49,
    customerName: 'EXAT',
    paymentTerm: 6,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2023-ICS-PJ-033',
    budget: 24160700.00,
    customerName: 'ICS',
    paymentTerm: 6,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2023-ICS-PJ-033_2',
    budget: 30000000.00,
    customerName: 'ICS',
    paymentTerm: 6,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2023-DOH-PJ-022',
    budget: 386000000.00,
    customerName: 'DOH',
    paymentTerm: 7,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2023-TTB-PJ-084',
    budget: 1410046.73,
    customerName: 'TTB',
    paymentTerm: 3,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-TTB-PJ-014',
    budget: 1361682.24,
    customerName: 'TTB',
    paymentTerm: 3,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-TTB-PJ-050',
    budget: 682242.99,
    customerName: 'TTB',
    paymentTerm: 1,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-MOAC-PJ-042',
    budget: 15887850.47,
    customerName: 'MOAC',
    paymentTerm: 4,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-SRT-MA-048',
    budget: 11151600.00,
    customerName: 'SRT',
    paymentTerm: 4,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-NSC-PJ-041',
    budget: 2239000.00,
    customerName: 'NSC',
    paymentTerm: 1,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-NT-PJ-066',
    budget: 39561000.00,
    customerName: 'NT',
    paymentTerm: 4,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-YIT-PJ-056',
    budget: 4170000.00,
    customerName: 'YIP',
    paymentTerm: 4,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2024-YIT-PJ-057',
    budget: 532000.00,
    customerName: 'YIP',
    paymentTerm: 1,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2025-DOH-PJ-005',
    budget: 185046.73,
    customerName: 'DOH',
    paymentTerm: 1,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2025-ISTM-PJ-006',
    budget: 98100.00,
    customerName: 'IISTM',
    paymentTerm: 2,
    status: 'ACTIVE'
  },
  {
    jobCode: 'A-2025-DRRAA-PJ-011',
    budget: 1551401.87,
    customerName: 'DRRAA',
    paymentTerm: 2,
    status: 'ACTIVE'
  }
];

async function insertProjectData() {
  try {
    console.log('Starting to insert project data...');
    
    for (const project of projectData) {
      const existingProject = await prisma.project.findFirst({
        where: { jobCode: project.jobCode }
      });
      
      if (existingProject) {
        console.log(`Project ${project.jobCode} already exists, updating...`);
        await prisma.project.update({
          where: { id: existingProject.id },
          data: {
            budget: project.budget,
            customerName: project.customerName,
            paymentTerm: project.paymentTerm.toString(),
            status: project.status
          }
        });
      } else {
        console.log(`Creating new project: ${project.jobCode}`);
        await prisma.project.create({
          data: {
            jobCode: project.jobCode,
            name: `${project.customerName} - ${project.jobCode}`,
            budget: project.budget,
            customerName: project.customerName,
            paymentTerm: project.paymentTerm.toString(),
            status: project.status,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      }
    }
    
    console.log('Project data insertion completed successfully!');
    
    // Display summary
    const totalProjects = await prisma.project.count();
    console.log(`Total projects in database: ${totalProjects}`);
    
    const projectsByCustomer = await prisma.project.groupBy({
      by: ['customerName'],
      _count: { customerName: true },
      _sum: { budget: true }
    });
    
    console.log('\nProjects by Customer:');
    projectsByCustomer.forEach(customer => {
      console.log(`${customer.customerName}: ${customer._count.customerName} projects, Total Budget: ${customer._sum.budget?.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error inserting project data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertProjectData(); 