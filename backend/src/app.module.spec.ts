jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {},
  })),
}));

jest.mock('@prisma/adapter-planetscale', () => ({
  PrismaPlanetScale: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('./prisma/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    const prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.$disconnect();
  });

  it('PrismaServiceがグローバルに利用可能であること', () => {
    const prismaService = app.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
  });
});