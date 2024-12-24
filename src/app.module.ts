import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamicTableModule } from './dynamic-table/dynamic-table.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicTable } from './dynamic-table/entities/table.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'postgres', // Change to your database type
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'Samarth@12',
      database: 'TABLES',
      entities: [DynamicTable],
      synchronize: true, // Don't use in production
  }),DynamicTableModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
