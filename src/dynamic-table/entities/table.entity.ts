import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DynamicTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { default: [] })
  columns: {id: number,name: string}[];


  @Column('jsonb', { default: [],nullable: true })
  rows: Record<string, any>[];
}
