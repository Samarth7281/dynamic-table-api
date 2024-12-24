import { Module } from '@nestjs/common';
import { DynamicTableController } from './dynamic-table.controller';
import { DynamicTableService } from './dynamic-table.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicTable } from './entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DynamicTable])],
  controllers: [DynamicTableController],
  providers: [DynamicTableService]
})
export class DynamicTableModule {}
