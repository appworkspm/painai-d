import { prisma } from '../src/utils/database';
import fs from 'fs';

async function backup() {
  try {
    const users = await prisma.user.findMany();
    const projects = await prisma.project.findMany();
    fs.writeFileSync('backup_users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('backup_projects.json', JSON.stringify(projects, null, 2));
    console.log('Backup completed: backup_users.json, backup_projects.json');
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
