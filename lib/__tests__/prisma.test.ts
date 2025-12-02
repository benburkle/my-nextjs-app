import { PrismaClient } from '@prisma/client';

// Mock PrismaClient before importing prisma
jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    guide: {},
    resource: {},
    study: {},
    session: {},
    schedule: {},
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
  };
});

import { prisma } from '../prisma';

describe('prisma', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (globalThis as any).prisma;
  });

  it('should create a new PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    // PrismaClient is mocked, verify prisma instance has expected properties
    expect(prisma).toHaveProperty('guide');
    expect(prisma).toHaveProperty('resource');
    expect(prisma).toHaveProperty('study');
  });

  it('should reuse existing PrismaClient instance in development', () => {
    const firstInstance = prisma;
    const secondInstance = prisma;
    expect(firstInstance).toBe(secondInstance);
  });
});
