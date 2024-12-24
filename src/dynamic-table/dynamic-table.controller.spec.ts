import { Test, TestingModule } from '@nestjs/testing';
import { DynamicTableController } from './dynamic-table.controller';
import { DynamicTableService } from './dynamic-table.service';
import { HttpException } from '@nestjs/common';

describe('DynamicTableController', () => {
  let controller: DynamicTableController;
  let service: DynamicTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynamicTableController],
      providers: [
        {
          provide: DynamicTableService,
          useValue: {
            createTable: jest.fn(),
            addColumn: jest.fn(),
            addRow: jest.fn(),
            getTable: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DynamicTableController>(DynamicTableController);
    service = module.get<DynamicTableService>(DynamicTableService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTable', () => {
    it('should call service.createTable and return result', async () => {
      const table = { id: 1, columns: [], rows: [] };
      jest.spyOn(service, 'createTable').mockResolvedValue(table);

      const result = await controller.createTable();
      expect(result).toEqual(table);
    });
  });

  describe('addColumn', () => {
    it('should call service.addColumn with correct parameters', async () => {
      jest.spyOn(service, 'addColumn').mockResolvedValue({ message: 'Column added', columns: ['name'] });

      const result = await controller.addColumn(1, 'name');
      expect(result).toEqual({ message: 'Column added', columns: ['name'] });
    });

    it('should throw an error if tableId or columnName is missing', async () => {
      await expect(controller.addColumn(null, 'name')).rejects.toThrow(HttpException);
      await expect(controller.addColumn(1, null)).rejects.toThrow(HttpException);
    });
  });

  describe('addRow', () => {
    it('should call service.addRow with correct parameters', async () => {
      const row = { name: 'John' };
      jest.spyOn(service, 'addRow').mockResolvedValue({ message: 'Row added', rows: [row] });

      const result = await controller.addRow(1, row);
      expect(result).toEqual({ message: 'Row added', rows: [row] });
    });

    it('should throw an error if tableId or rowData is invalid', async () => {
      await expect(controller.addRow(null, { name: 'John' })).rejects.toThrow(HttpException);
      await expect(controller.addRow(1, null)).rejects.toThrow(HttpException);
    });
  });

  describe('getTable', () => {
    it('should call service.getTable and return result', async () => {
      const table = { id: 1, columns: ['name'], rows: [] };
      jest.spyOn(service, 'getTable').mockResolvedValue(table);

      const result = await controller.getTable(1);
      expect(result).toEqual(table);
    });

    it('should throw an error if tableId is missing', async () => {
      await expect(controller.getTable(null)).rejects.toThrow(HttpException);
    });
  });
});
