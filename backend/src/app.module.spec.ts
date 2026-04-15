jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    user = {};
    constructor(_options?: unknown) {}
  }
  return { PrismaClient: MockPrismaClient };
});

jest.mock('@prisma/adapter-planetscale', () => ({
  PrismaPlanetScale: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  let app: TestingModule;

  beforeEach(async () => {
    process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/testdb';
    app = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  afterEach(async () => {
    delete process.env.DATABASE_URL;
    const prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.$disconnect();
  });

  it('PrismaServiceがグローバルに利用可能であること', () => {
    const prismaService = app.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
  });
});
