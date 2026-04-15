import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { StoreSettingsEntity } from './entities/store-settings.entity';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettingsController } from './store-settings.controller';

@Module({
  imports: [],
  controllers: [StoreSettingsController],
  providers: [StoreSettingsService],
  exports: [StoreSettingsService],
})
export class StoreSettingsModule {}
