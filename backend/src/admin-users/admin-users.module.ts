import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';
import { AdminUsersService } from './admin-users.service';
import { AdminAccountsController } from './admin-accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserEntity])],
  providers: [AdminUsersService],
  controllers: [AdminAccountsController],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
