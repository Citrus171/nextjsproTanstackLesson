import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from '../../admin-users/entities/admin-user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
