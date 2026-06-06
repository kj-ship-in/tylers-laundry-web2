'use client';

import { useState, useMemo, useCallback } from 'react';

import { Search, X, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';

import TablePagination from './TablePagination';
import type { DataTableProps, SortConfig } from '@/types/table';

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  className = '',
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize: initialPageSize = 10,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  buttonTitle = 'Add',
  loading = false,
  onRowClick,
  rowKey = '_id',
  stickyHeader = false,
  compact = false,
  showButton = false,
  onClick,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    let filtered = sortedData;

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        filtered = filtered.filter(item => {
          const itemValue = item[key as keyof T];
          return String(itemValue || '')
            .toLowerCase()
            .includes(value.toLowerCase());
        });
      }
    });

    if (globalFilter.trim()) {
      const searchTerm = globalFilter.toLowerCase();
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = column.key ? item[column.key] : null;
          return String(value ?? '')
            .toLowerCase()
            .includes(searchTerm);
        }),
      );
    }

    return filtered;
  }, [sortedData, filters, globalFilter, columns]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = enablePagination
    ? filteredData.slice(startIndex, startIndex + pageSize)
    : filteredData;

  const handleSort = useCallback(
    (key: string) => {
      if (!enableSorting) return;

      setSortConfig(prev => ({
        key,
        direction:
          prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    },
    [enableSorting],
  );

  const handleGlobalFilter = useCallback((value: string) => {
    setGlobalFilter(value);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setGlobalFilter('');
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return String(rowKey(row, index));
      }
      return String(row[rowKey] || index);
    },
    [rowKey],
  );

  const hasActiveFilters =
    Object.values(filters).some(f => f.trim()) || globalFilter.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      {enableFiltering && (
        <div className='flex items-center justify-between gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              type='text'
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={e => handleGlobalFilter(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
            />
          </div>
          {hasActiveFilters && (
            <Button
              size='lg'
              onClick={clearFilters}
              className='flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <X className='h-4 w-4' />
              Clear filters
            </Button>
          )}

          {showButton && (
            <Button
              onClick={onClick}
              size='lg'
              className='bg-blue-600 hover:bg-blue-700'
            >
              {buttonTitle}
            </Button>
          )}
        </div>
      )}

      <div className='border border-gray-200 rounded-lg overflow-hidden'>
        <div
          className={
            stickyHeader ? 'max-h-96 overflow-auto' : 'overflow-x-auto'
          }
        >
          <Table className='min-w-full'>
            <TableHeader
              className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
            >
              <TableRow>
                {columns.map((column, colIdx) => (
                  <TableHead
                    key={`col-${String(column.key) || column.title}-${colIdx}`}
                    className={`px-4 py-3 text-left whitespace-nowrap ${compact ? 'px-2 py-2' : ''} ${column.className ?? ''}`}
                    style={{ width: column.width }}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        column.align === 'center'
                          ? 'justify-center'
                          : column.align === 'right'
                            ? 'justify-end'
                            : ''
                      }`}
                    >
                      {enableSorting && column.sortable !== false ? (
                        <button
                          onClick={() => handleSort(String(column.key))}
                          className='flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 transition-colors group'
                        >
                          {column.title}
                          <div className='flex flex-col'>
                            {sortConfig.key === String(column.key) ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className='h-4 w-4 text-blue-600' />
                              ) : (
                                <ChevronDown className='h-4 w-4 text-blue-600' />
                              )
                            ) : (
                              <ArrowUpDown className='h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity' />
                            )}
                          </div>
                        </button>
                      ) : (
                        <span className='w-1/4 font-medium text-gray-700'>
                          {column.title}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y divide-gray-200'>
              {loading ? (
                Array.from({ length: pageSize }).map((_, rowIdx) => (
                  <TableRow
                    key={`skeleton-${rowIdx}`}
                    className='hover:bg-gray-50'
                  >
                    {columns.map((_, colIdx) => (
                      <TableCell
                        key={`skeleton-cell-${rowIdx}-${colIdx}`}
                        className={`px-4 py-3 ${compact ? 'px-2 py-2' : ''} ${columns[colIdx]?.className ?? ''}`}
                      >
                        <Skeleton className='h-6 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={getRowKey(row, rowIndex)}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${compact ? 'text-sm' : ''}`}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {columns.map((column, colIdx) => (
                      <TableCell
                        key={`cell-${colIdx}`}
                        className={`px-4 py-3 text-gray-900 ${compact ? 'px-2 py-2' : ''} ${
                          column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                              ? 'text-right'
                              : ''
                        } ${column.className ?? ''}`}
                      >
                        {column.render
                          ? column.render(row[column.key!], row, rowIndex)
                          : column.key
                            ? row[column.key]
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showSizeChanger
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default DataTable;
