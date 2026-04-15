import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPlanetScale } from '@prisma/adapter-planetscale';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const adapter = databaseUrl
      ? new PrismaPlanetScale({ url: databaseUrl })
      : undefined;
    super(adapter ? { adapter } : {});
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    if (!process.env.DATABASE_URL) {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}