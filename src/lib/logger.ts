import { prisma } from './prisma';

export async function logActivity(action: string, details: string, adminId: string, adminName: string) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        details,
        adminId,
        adminName
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
