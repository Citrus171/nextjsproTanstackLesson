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
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/testdb';

    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
    jest.restoreAllMocks();
  });

  it('PrismaServiceが提供されていること', () => {
    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });

  it('PrismaServiceがPrismaClientのメソッドを持っていること', () => {
    const service = module.get<PrismaService>(PrismaService);
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.user).toBe('object');
  });
});
