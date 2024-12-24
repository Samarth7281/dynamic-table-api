import { Test, TestingModule } from '@nestjs/testing';
import { DynamicTableService } from './dynamic-table.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DynamicTable } from './entities/table.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('DynamicTableService', () => {
  let service: DynamicTableService;
  let repository: Repository<DynamicTable>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicTableService,
        {
          provide: getRepositoryToken(DynamicTable),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DynamicTableService>(DynamicTableService);
    repository = module.get<Repository<DynamicTable>>(getRepositoryToken(DynamicTable));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTable', () => {
    it('should create and return a new table', async () => {
      const newTable = { id: 1, columns: [], rows: [] };
      jest.spyOn(repository, 'create').mockReturnValue(newTable);
      jest.spyOn(repository, 'save').mockResolvedValue(newTable);

      const result = await service.createTable();
      expect(result).toEqual(newTable);
    });
  });

  describe('addColumn', () => {
    it('should add a column to the table', async () => {
      const table = { id: 1, columns: ['name'], rows: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(table);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...table, columns: ['name', 'age'] });

      const result = await service.addColumn('age', 1);
      expect(result).toEqual({ message: 'Column added', columns: ['name', 'age'] });
    });

    it('should throw an error if table is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.addColumn('age', 1)).rejects.toThrow(HttpException);
    });
  });

  // describe('addColumn', () => {
  //   it('should throw an error if trying to add an empty column name', async () => {
  //     const table = { id: 1, columns: ['name'], rows: [] };
  //     jest.spyOn(repository, 'findOne').mockResolvedValue(table);

  //     await expect(service.addColumn('', 1)).rejects.toThrow('Invalid column name');
  //   });
  // });

  describe('addRow', () => {
    it('should add a valid row to the table', async () => {
      const table = { id: 1, columns: ['name', 'age'], rows: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(table);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...table, rows: [{ name: 'John', age: 30 }] });

      const result = await service.addRow({ name: 'John', age: 30 }, 1);
      expect(result).toEqual({ message: 'Row added', rows: [{ name: 'John', age: 30 }] });
    });

    it('should throw an error if column does not exist', async () => {
      const table = { id: 1, columns: ['name'], rows: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(table);

      await expect(service.addRow({ age: 30 }, 1)).rejects.toThrow(HttpException);
    });
  });

  describe('getTable', () => {
    it('should return the table if it exists', async () => {
      const table = { id: 1, columns: ['name'], rows: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(table);

      const result = await service.getTable(1);
      expect(result).toEqual(table);
    });

    it('should throw an error if the table is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getTable(1)).rejects.toThrow(HttpException);
    });
  });
});
