import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUser, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async create(
    name: string,
    email: string,
    password: string,
    role: AdminRole,
  ): Promise<AdminUserResponse> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const saved = await this.prisma.adminUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return this.toResponse(saved);
  }

  async findAll(): Promise<AdminUserResponse[]> {
    const admins = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return admins.map((admin) => this.toResponse(admin));
  }

  async findById(id: number): Promise<AdminUserResponse | null> {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    return admin ? this.toResponse(admin) : null;
  }

  async update(id: number, input: UpdateAdminUserInput): Promise<AdminUserResponse | null> {
    const updateData: Partial<AdminUser> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.role !== undefined) {
      updateData.role = input.role;
    }

    try {
      const updated = await this.prisma.adminUser.update({
        where: { id },
        data: updateData,
      });
      return this.toResponse(updated);
    } catch {
      return null;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await this.prisma.adminUser.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toResponse(admin: AdminUser): AdminUserResponse {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }
}
