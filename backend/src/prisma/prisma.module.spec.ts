import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // onModuleInit を呼ばないように、mock
    jest.spyOn(PrismaService.prototype, 'onModuleInit').mockResolvedValue();

    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  it('PrismaServiceが提供されていること', () => {
    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });

  it('PrismaServiceがPrismaClientのメソッドを持っていること', () => {
    const service = module.get<PrismaService>(PrismaService);
    // $connect が存在することを確認（PrismaClientのメソッド）
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.user).toBe('object'); // PrismaClientのモデルアクセス
  });
});