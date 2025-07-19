import { prisma } from '../src/utils/database';
import fs from 'fs';


function filterUserFields(user: Record<string, any>): Record<string, any> {
  const allowed = [
    'id', 'email', 'password', 'name', 'role', 'isActive', 'createdAt', 'updatedAt',
    'failedLoginAttempts', 'isDeleted', 'lastLogin', 'lockedUntil', 'resetToken',
    'resetTokenExpiry', 'position',
  ];
  const filtered: { [key: string]: any } = {};
  for (const key of allowed) {
    if (user[key] !== undefined) filtered[key] = user[key];
  }
  if (!filtered.id) filtered.id = (globalThis.crypto?.randomUUID?.() || require('crypto').randomUUID());
  if (!filtered.createdAt) filtered.createdAt = new Date();
  if (!filtered.updatedAt) filtered.updatedAt = new Date();
  return filtered;
}

function filterProjectFields(project: Record<string, any>): Record<string, any> {
  const allowed = [
    'id', 'name', 'description', 'status', 'createdAt', 'updatedAt', 'managerId',
    'isDeleted', 'budget', 'endDate', 'startDate', 'customerName', 'jobCode',
    'paymentCondition', 'paymentTerm', 'escalated'
  ];
  const filtered: { [key: string]: any } = {};
  for (const key of allowed) {
    if (project[key] !== undefined) filtered[key] = project[key];
  }
  if (!filtered.id) filtered.id = (globalThis.crypto?.randomUUID?.() || require('crypto').randomUUID());
  if (!filtered.createdAt) filtered.createdAt = new Date();
  if (!filtered.updatedAt) filtered.updatedAt = new Date();
  return filtered;
}

async function restore() {
  try {
    const users = JSON.parse(fs.readFileSync('backup_users.json', 'utf-8'));
    const projects = JSON.parse(fs.readFileSync('backup_projects.json', 'utf-8'));
    for (const user of users) {
      const filtered = filterUserFields(user);
      await prisma.user.upsert({
        where: { id: filtered.id },
        update: filtered as any,
        create: filtered as any
      });
    }
    for (const project of projects) {
      const filtered = filterProjectFields(project);
      await prisma.project.upsert({
        where: { id: filtered.id },
        update: filtered as any,
        create: filtered as any
      });
    }
    console.log('Restore completed: users and projects');
  } catch (error) {
    console.error('Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
