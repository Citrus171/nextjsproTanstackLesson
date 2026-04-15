jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    constructor(_options?: unknown) {}
  }
  return { PrismaClient: MockPrismaClient };
});

jest.mock('@prisma/adapter-planetscale', () => ({
  PrismaPlanetScale: jest.fn().mockImplementation(() => ({})),
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/testdb';
    service = new PrismaService();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('DATABASE_URLが未設定の場合は$connectを呼ばないこと', async () => {
    delete process.env.DATABASE_URL;
    const svcWithoutUrl = new PrismaService();
    process.env.NODE_ENV = 'development';
    const connectSpy = jest.spyOn(svcWithoutUrl, '$connect').mockResolvedValue();
    await svcWithoutUrl.onModuleInit();
    expect(connectSpy).not.toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('onModuleInit should call $connect when not in test env', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('onModuleInit should not call $connect in test env', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('onModuleDestroy should call $disconnect', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
