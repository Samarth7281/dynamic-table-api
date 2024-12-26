import { Module } from '@nestjs/common';
import { DynamicTableController } from './dynamic-table.controller';
import { DynamicTableService } from './dynamic-table.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicTable } from './entities/table.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([DynamicTable]),ClientsModule.register([
    {
      name: 'KAFKA_SERVICE',
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'dynamic-table-group',
        },
      },
    },
  ]),],
  controllers: [DynamicTableController],
  providers: [DynamicTableService],
})
export class DynamicTableModule {}
