const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// User data from the table
const usersData = [
  {
    employeeCode: '0285',
    name: 'Thanongsak Thongkwid',
    position: 'Vice President',
    email: 'thanongsak.th@appworks.co.th',
    password: 'password123',
    role: 'ADMIN'
  },
  {
    employeeCode: '0183',
    name: 'Pratya Fufueng',
    position: 'Senior Project Manager',
    email: 'Pratya.fu@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0243',
    name: 'Pattaraprapa Chotipattachakorn',
    position: 'Senior Project Manager',
    email: 'pattaraprapa.ch@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0134',
    name: 'Sophonwith Valaisathien',
    position: 'Senior Project Manager',
    email: 'sophonwith.va@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0111',
    name: 'Suthat Wanprom',
    position: 'Project Manager',
    email: 'Suthat.wa@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0240',
    name: 'Napapha Tipaporn',
    position: 'Project Manager',
    email: 'napapha.ti@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0272',
    name: 'Thapana Chatmanee',
    position: 'Project Manager',
    email: 'thapana.ch@appworks.co.th',
    password: 'password123',
    role: 'ADMIN'
  },
  {
    employeeCode: '0274',
    name: 'Nawin Bunjopbutsa',
    position: 'Project Manager',
    email: 'nawin.bu@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0281',
    name: 'Jakgrits Phoongen',
    position: 'Project Manager',
    email: 'jakgrits.ph@appworks.co.th',
    password: 'password123',
    role: 'ADMIN'
  },
  {
    employeeCode: '0294',
    name: 'Pannee Sae-Chee',
    position: 'Project Manager',
    email: 'pannee.sa@appworks.co.th',
    password: 'password123',
    role: 'MANAGER'
  },
  {
    employeeCode: '0306',
    name: 'Sasithon Sukha',
    position: 'Project Coordinator',
    email: 'sasithon.su@appworks.co.th',
    password: 'password123',
    role: 'ADMIN'
  }
];

async function insertUsers() {
  try {
    console.log('👥 Starting user data insertion...\n');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Password hashed successfully\n');

    // Insert users one by one
    const createdUsers = [];
    for (const userData of usersData) {
      try {
        const user = await prisma.user.create({
          data: {
            employeeCode: userData.employeeCode,
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            position: userData.position,
            role: userData.role,
            isActive: true
          }
        });

        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name} (${user.employeeCode}) - ${user.role}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User already exists: ${userData.name} (${userData.employeeCode})`);
        } else {
          console.error(`❌ Error creating user ${userData.name}:`, error.message);
        }
      }
    }

    // Summary
    console.log('\n📊 Insertion Summary:');
    console.log(`   Total users in data: ${usersData.length}`);
    console.log(`   Successfully created: ${createdUsers.length}`);
    console.log(`   Failed/Skipped: ${usersData.length - createdUsers.length}`);

    // Show created users
    if (createdUsers.length > 0) {
      console.log('\n👥 Created Users:');
      createdUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.employeeCode}) - ${user.email} - ${user.role}`);
      });
    }

    console.log('\n🎉 User insertion completed!');

  } catch (error) {
    console.error('❌ Error during user insertion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the insertion
insertUsers()
  .then(() => {
    console.log('\n✅ User insertion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ User insertion failed:', error);
    process.exit(1);
  }); 