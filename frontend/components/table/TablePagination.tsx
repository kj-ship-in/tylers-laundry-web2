'use client';

import { useMemo } from 'react';

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import type { TablePaginationProps } from '@/types/table';

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  showSizeChanger = false,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-4 ${className}`}
    >
      <div className='flex items-center gap-4'>
        <div className='text-sm text-gray-700'>
          Showing {startItem} to {endItem} of {totalItems} results
        </div>

        {showSizeChanger && onPageSizeChange && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-700'>Show</span>
            <select
              title='Page Size'
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className='px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500'
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className='text-sm text-gray-700'>per page</span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
          title='First page'
        >
          <ChevronsLeft className='h-4 w-4' />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
          title='Previous page'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>

        {getPageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
              page === currentPage
                ? 'bg-[#093859] hover:bg-[#093859] text-white border-[#093859]'
                : page === '...'
                  ? 'border-transparent cursor-default'
                  : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
          title='Next page'
        >
          <ChevronRight className='h-4 w-4' />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
          title='Last page'
        >
          <ChevronsRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
