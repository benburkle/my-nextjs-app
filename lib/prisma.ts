import { PrismaClient } from '../.prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  // In development, clear the cached client if models are missing
  if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
    // Check if key models exist
    if (!('guide' in globalForPrisma.prisma) || 
        !('resource' in globalForPrisma.prisma) ||
        !('study' in globalForPrisma.prisma)) {
      console.warn('Prisma client missing models, recreating...');
      delete (globalThis as any).prisma;
      globalForPrisma.prisma = undefined;
    }
  }
  
  return globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

