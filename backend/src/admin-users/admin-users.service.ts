import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUserEntity, AdminRole } from './entities/admin-user.entity';

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: Date;
}

export interface UpdateAdminUserInput {
  name?: string;
  role?: AdminRole;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {}

  findByEmail(email: string): Promise<AdminUserEntity | null> {
    return this.adminUserRepository.findOneBy({ email });
  }

  async create(
    name: string,
    email: string,
    password: string,
    role: AdminRole,
  ): Promise<AdminUserResponse> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new AdminUserEntity();
    admin.name = name;
    admin.email = email;
    admin.password = hashedPassword;
    admin.role = role;

    const saved = await this.adminUserRepository.save(admin);

    return this.toResponse(saved);
  }

  async findAll(): Promise<AdminUserResponse[]> {
    const admins = await this.adminUserRepository.find({
      order: { createdAt: 'DESC' },
    });
    return admins.map((admin) => this.toResponse(admin));
  }

  async findById(id: number): Promise<AdminUserResponse | null> {
    const admin = await this.adminUserRepository.findOneBy({ id });
    return admin ? this.toResponse(admin) : null;
  }

  async update(id: number, input: UpdateAdminUserInput): Promise<AdminUserResponse | null> {
    const admin = await this.adminUserRepository.findOneBy({ id });
    if (!admin) {
      return null;
    }

    if (input.name !== undefined) {
      admin.name = input.name;
    }
    if (input.role !== undefined) {
      admin.role = input.role;
    }

    const updated = await this.adminUserRepository.save(admin);
    return this.toResponse(updated);
  }

  async softDelete(id: number): Promise<boolean> {
    const admin = await this.adminUserRepository.findOneBy({ id });
    if (!admin) {
      return false;
    }

    admin.deletedAt = new Date();
    await this.adminUserRepository.save(admin);
    return true;
  }

  private toResponse(admin: AdminUserEntity): AdminUserResponse {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }
}
