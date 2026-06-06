import type { MouseEventHandler, ReactNode } from 'react';

export interface TableAction<T = any> {
  type: 'button' | 'link';
  label: string;
  href?: string;
  onClick?: (row: T, index: number) => void;
  icon?: ReactNode;
  className?: string;
}

export interface Column<T = any> {
  key?: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (value: any, row?: T, index?: number) => ReactNode;
  actions?: TableAction<T>[];
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
  buttonTitle?: string;
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  stickyHeader?: boolean;
  compact?: boolean;
  showButton?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}
