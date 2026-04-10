import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {}

  findByEmail(email: string): Promise<AdminUserEntity | null> {
    return this.adminUserRepository.findOneBy({ email });
  }
}
