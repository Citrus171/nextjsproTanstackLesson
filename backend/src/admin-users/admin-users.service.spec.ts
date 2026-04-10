import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUsersService } from './admin-users.service';
import { AdminUserEntity } from './entities/admin-user.entity';

const makeAdmin = (overrides: Partial<AdminUserEntity> = {}): AdminUserEntity =>
  Object.assign(new AdminUserEntity(), {
    id: 1,
    email: 'admin@example.com',
    password: 'hashed',
    name: '管理者',
    role: 'general',
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    ...overrides,
  });

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let repo: jest.Mocked<Repository<AdminUserEntity>>;

  beforeEach(async () => {
    const mockRepo: jest.Mocked<Partial<Repository<AdminUserEntity>>> = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getRepositoryToken(AdminUserEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    repo = module.get(getRepositoryToken(AdminUserEntity));
  });

  describe('findByEmail', () => {
    it('存在するメールアドレスの時、AdminUserEntityを返すこと', async () => {
      const admin = makeAdmin({ email: 'admin@example.com' });
      repo.findOneBy.mockResolvedValue(admin);

      const result = await service.findByEmail('admin@example.com');

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(result).toEqual(admin);
    });

    it('存在しないメールアドレスの時、nullを返すこと', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });
});
