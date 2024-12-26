import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { DynamicTableService } from './dynamic-table.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('dynamic-table')
export class DynamicTableController {
  constructor(private readonly dynamicTableService: DynamicTableService) {}

  @MessagePattern('table-events')
  async handleTableEvents(@Payload() message: any) {
    const { action,data } = message;
    const { tableId, rowData } = data || {}
    switch (action) {
      case 'createTable':
        this.dynamicTableService.createTable();
        console.log('Table created using kafka');
        break;

      case 'createColumn':
        const {columnName} = data
        this.dynamicTableService.addColumn(columnName,tableId);
        console.log('Column created using kafka');
        break;

      case 'createRow':
        this.dynamicTableService.addRow(rowData,tableId);
        console.log('row created using kafka');
        break;

      case 'getTable':
        const table = this.dynamicTableService.getTable(tableId)
        console.log('Table fetched using kafka')
        return table
        break;
    }
  }

  @Post('create-table')
  async createTable() {
    return await this.dynamicTableService.createTable();
  }

  @Post('add-column')
  async addColumn(
    @Body('tableId') tableId: number,
    @Body('columnName') columnName: string,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!columnName) {
      throw new HttpException(
        'Column name is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.dynamicTableService.addColumn(columnName, tableId);
  }

  @Post('add-row')
  async addRow(
    @Body('tableId') tableId: number,
    @Body('rowData') rowData: Record<number, any>,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!rowData || typeof rowData !== 'object') {
      throw new HttpException(
        'Row data must be a valid object',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.dynamicTableService.addRow(rowData, tableId);
  }

  @Get()
  async getTable(@Body('tableId') tableId: number) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    return await this.dynamicTableService.getTable(tableId);
  }

  @Delete('delete-single-value')
  async deleteSingleValue(
    @Body('tableId') tableId: number,
    @Body('columnId') columnId: number,
    @Body('rowIndex') rowIndex: number,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!columnId) {
      throw new HttpException('Column ID is required', HttpStatus.BAD_REQUEST);
    }
    if (rowIndex === undefined || rowIndex === null) {
      throw new HttpException('Row index is required', HttpStatus.BAD_REQUEST);
    }
    if (rowIndex < 0) {
      throw new HttpException(
        'Row index must be non-negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.dynamicTableService.deleteSingleRowValue(
        tableId,
        columnId,
        rowIndex,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred while deleting the value',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-column')
  async deleteColumn(
    @Body('tableId') tableId: number,
    @Body('columnId') columnId: number,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!columnId) {
      throw new HttpException('Column ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.dynamicTableService.deleteColumn(
        tableId,
        columnId,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred while deleting the column',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-row')
  async deleteRow(
    @Body('tableId') tableId: number,
    @Body('rowIndex') rowIndex: number,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!rowIndex) {
      throw new HttpException('Row index is required', HttpStatus.BAD_REQUEST);
    }
    return this.dynamicTableService.deleteRow(rowIndex, tableId);
  }

  @Put('update-column')
  async updateColumn(
    @Body('tableId') tableId: number,
    @Body('columnId') columnId: number,
    @Body('columnName') columnName: string,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!columnId) {
      throw new HttpException('Column ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!columnName) {
      throw new HttpException(
        'Column name is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dynamicTableService.updateColumn(columnId, columnName, tableId);
  }

  @Put('update-row')
  async updateRow(
    @Body('tableId') tableId: number,
    @Body('rowData') rowData: Record<number, any>,
    @Body('rowIndex') rowIndex: number,
  ) {
    if (!tableId) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!rowData) {
      throw new HttpException('Table ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.dynamicTableService.updateRow(rowIndex, rowData, tableId);
  }
}
