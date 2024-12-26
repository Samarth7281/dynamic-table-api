import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DynamicTable } from './entities/table.entity';
import { Repository } from 'typeorm';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class DynamicTableService {
  constructor(
    @InjectRepository(DynamicTable)
    private readonly tableRepo: Repository<DynamicTable>,
  ) {}

  

  async createTable() {
    const newTable = this.tableRepo.create();
    const savedTable = await this.tableRepo.save(newTable);
    return savedTable;
  }

  async addColumn(columnName: string, id: number) {
    const table = await this.tableRepo.findOne({ where: { id } });

    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }

    const columnId = new Date().getTime();

    table.columns = [
      ...(table.columns || []),
      { id: columnId, name: columnName },
    ];

    await this.tableRepo.save(table);

    return { message: 'Column added', columns: table.columns };
  }

  async addRow(rowData: Record<string, any>, id: number) {
    const table = await this.tableRepo.findOne({ where: { id } });

    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }

    const columnIds = table.columns.map((column) => column.id);
    const invalidColumns = Object.keys(rowData).filter(
      (columnId) => !columnIds.includes(Number(columnId)),
    );

    if (invalidColumns.length > 0) {
      throw new HttpException(
        `Invalid column IDs: ${invalidColumns.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    table.rows = [...(table.rows || []), rowData];

    await this.tableRepo.save(table);

    return { message: 'Row added', rows: table.rows };
  }

  async getTable(id: number) {
    const table = await this.tableRepo.findOne({ where: { id } });
    
    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }
  
    console.log('Raw table rows:', JSON.stringify(table.rows, null, 2));
    console.log('Columns:', JSON.stringify(table.columns, null, 2));
  
    // Map column IDs to their names
    const columnMap = table.columns.reduce((acc, column) => {
      acc[column.id] = column.name;
      return acc;
    }, {} as Record<string, string>);
  
    // Track unique row combinations
    const rowCombinations: Record<string, Record<string, any>> = {};
  
    table.rows.forEach((row: any) => {
      // Get the column ID and value from the row
      const columnId = Object.keys(row)[0];
      const value = row[columnId];
      const columnName = columnMap[columnId];
  
      console.log(`Processing row: columnId=${columnId}, value=${value}, columnName=${columnName}`);
  
      // Find an existing combination or create a new one
      const existingCombination = Object.values(rowCombinations).find(
        combination => combination[columnName] === undefined
      );
  
      if (existingCombination) {
        // Add to existing combination
        existingCombination[columnName] = value;
      } else {
        // Create a new combination
        const newCombination: Record<string, any> = {};
        newCombination[columnName] = value;
        rowCombinations[Math.random().toString()] = newCombination;
      }
    });
  
    // Convert to array and ensure all columns are present
    const combinedRows = Object.values(rowCombinations).map(combination => {
      const fullRow: Record<string, any> = {};
      table.columns.forEach(column => {
        fullRow[column.name] = combination[column.name] ?? undefined;
      });
      return fullRow;
    }).filter(row => 
      Object.values(row).some(value => value !== undefined)
    );
  
    console.log('Processed rows:', JSON.stringify(combinedRows, null, 2));
  
    return {
      id: table.id,
      columns: table.columns,
      rows: combinedRows,
    };
  }
  
  
  
  

  async deleteSingleRowValue(
    tableId: number,
    columnId: number,
    rowIndex: number,
  ) {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });

    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }

    const columnIds = table.columns.map((column) => column.id);

    if (!columnIds.includes(columnId)) {
      throw new HttpException('Column not found', HttpStatus.BAD_REQUEST);
    }

    if (rowIndex < 0 || rowIndex >= table.rows.length) {
      throw new HttpException(
        'Row index is out of bounds',
        HttpStatus.BAD_REQUEST,
      );
    }

    const row = table.rows[rowIndex];
    if (row[columnId] === undefined) {
      throw new HttpException(
        `Value not found in column with ID: ${columnId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Delete the specific value from the row
    delete row[columnId];

    // Remove the row entirely if it becomes empty
    if (Object.keys(row).length === 0) {
      table.rows.splice(rowIndex, 1);
    }

    // Save the updated table
    await this.tableRepo.save(table);

    return {
      message: `Value deleted from column ID: ${columnId} in row index: ${rowIndex}`,
      rows: table.rows,
    };
  }

  async deleteRow(rowIndex: number, tableId: number) {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });
    
    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }
    
    if (rowIndex < 0 || rowIndex >= table.rows.length) {
      throw new HttpException(
        'Row index is out of bounds',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Create a result object
    const result = table.rows.reduce((acc, row) => {
      const [key, value] = Object.entries(row)[0];
      
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push(value);
      return acc;
    }, {});
  
    // Create a copy of the result object
    const updatedResult = { ...result };
  
    // Remove values at the specified row index
    for (const key in updatedResult) {
      if (rowIndex < updatedResult[key].length) {
        updatedResult[key].splice(rowIndex, 1);
      }
    }
  
    // Convert updatedResult back to rows format
    const updatedRows = Object.entries(updatedResult).flatMap(([key, values]) => 
      values.map(value => ({ [key]: value }))
    );
  
    // Update the table's rows
    table.rows = updatedRows;
  
    // Save the updated table
    const savedTable = await this.tableRepo.save(table);
  
    return savedTable;
  }

  async deleteColumn(tableId: number, columnId: number) {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });

    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }

    const columnIndex = table.columns.findIndex(
      (column) => column.id === columnId,
    );

    if (columnIndex === -1) {
      throw new HttpException('Column not found', HttpStatus.BAD_REQUEST);
    }

    table.columns.splice(columnIndex, 1);

    // Remove the associated values in rows
    table.rows = table.rows.map((row) => {
      delete row[columnId];
      return row;
    });

    await this.tableRepo.save(table);

    return {
      message: `Column ID: ${columnId} and its associated values have been deleted`,
      columns: table.columns,
      rows: table.rows,
    };
  }

  async updateColumn(columnId: number, columnName: string, tableId: number) {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });
  
    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }
  
    if (!table.columns || !Array.isArray(table.columns)) {
      throw new HttpException('No columns found in the table', HttpStatus.BAD_REQUEST);
    }
  
    const column = table.columns.find((col) => col.id === columnId);
  
    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
  
    column.name = columnName; // Update the column name
  
    await this.tableRepo.save(table);
  
    return { message: 'Column updated', columns: table.columns };
  }

  async updateRow(rowIndex: number, updatedRowData: Record<string, any>, tableId: number) {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });
  
    if (!table) {
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
    }
  
    if (!table.rows || !Array.isArray(table.rows)) {
      throw new HttpException('No rows found in the table', HttpStatus.BAD_REQUEST);
    }
  
    if (rowIndex < 0 || rowIndex >= table.rows.length) {
      throw new HttpException('Row index out of bounds', HttpStatus.BAD_REQUEST);
    }
  
    const columnIds = table.columns.map((column) => column.id);
    const invalidColumns = Object.keys(updatedRowData).filter(
      (columnId) => !columnIds.includes(Number(columnId)),
    );
  
    if (invalidColumns.length > 0) {
      throw new HttpException(
        `Invalid column IDs: ${invalidColumns.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Update the row 
    table.rows[rowIndex] = {
      ...table.rows[rowIndex], 
      ...updatedRowData,
    };
  
    await this.tableRepo.save(table);
  
    return { message: 'Row updated', rows: table.rows };
  }
  
  
}
