import { prisma } from '../utils/database';

export const logActivity = async ({
  userId,
  type,
  message,
  severity = 'info',
}: {
  userId?: string;
  type: string;
  message: string;
  severity?: string;
}) => {
  return prisma.activityLog.create({
    data: { userId, type, message, severity },
  });
}; 