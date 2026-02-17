'use client';

import React, { useState, useMemo, useCallback, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  X,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';

// Types
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  cell?: (value: unknown, row: T, rowIndex: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  serverSide?: boolean;
  currentPage?: number;
  
  // Sorting
  sortable?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  
  // Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchDebounce?: number;
  
  // Selection
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  
  // Actions
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
    custom?: Array<{
      icon?: ReactNode;
      label: string;
      onClick: (row: T) => void;
      show?: (row: T) => boolean;
      className?: string;
    }>;
  };
  actionsColumn?: boolean;
  
  // Styling
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  cellClassName?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  
  // Expandable rows
  expandable?: boolean;
  renderExpanded?: (row: T) => ReactNode;
  expandedKeys?: Set<string>;
  onExpand?: (keys: Set<string>) => void;
  
  // Sticky header
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

// Sort Icon Component
const SortIcon: React.FC<{ direction: SortDirection; active: boolean }> = ({ direction, active }) => {
  if (!direction) {
    return <ArrowUpDown className={cn('w-4 h-4', active ? 'text-primary-500' : 'text-neutral-400')} />;
  }
  
  return direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-primary-500" />
    : <ChevronDown className="w-4 h-4 text-primary-500" />;
};

// DataTable Component
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  
  // Pagination
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showPagination = true,
  totalItems,
  onPageChange,
  onPageSizeChange,
  serverSide = false,
  currentPage: externalPage,
  
  // Sorting
  sortable = true,
  defaultSortColumn,
  defaultSortDirection = null,
  onSort,
  
  // Filtering
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue: externalSearchValue,
  onSearch,
  searchDebounce = 300,
  
  // Selection
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  
  // Actions
  actions,
  actionsColumn = false,
  
  // Styling
  className,
  headerClassName,
  rowClassName,
  cellClassName,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  
  // Expandable
  expandable = false,
  renderExpanded,
  expandedKeys = new Set(),
  onExpand,
  
  // Sticky header
  stickyHeader = false,
  maxHeight,
}: DataTableProps<T>) {
  // Internal state
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(new Set());
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(new Set());
  
  // Use external or internal values
  const page = externalPage ?? internalPage;
  const actualPageSize = serverSide ? pageSize : internalPageSize;
  const searchValue = externalSearchValue ?? internalSearchValue;
  const actualSelectedKeys = onSelectionChange ? selectedKeys : internalSelectedKeys;
  const actualExpandedKeys = onExpand ? expandedKeys : internalExpandedKeys;
  
  // Filter data (client-side)
  const filteredData = useMemo(() => {
    if (serverSide || !searchValue) return data;
    
    return data.filter(row => {
      return columns.some(col => {
        const value = typeof col.accessor === 'function' 
          ? col.accessor(row) 
          : row[col.accessor as keyof T];
        return String(value).toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }, [data, searchValue, columns, serverSide]);
  
  // Sort data (client-side)
  const sortedData = useMemo(() => {
    if (serverSide || !sortColumn || !sortDirection) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortColumn);
      if (!column) return 0;
      
      const aVal = typeof column.accessor === 'function' 
        ? column.accessor(a) 
        : a[column.accessor as keyof T];
      const bVal = typeof column.accessor === 'function' 
        ? column.accessor(b) 
        : b[column.accessor as keyof T];
      
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns, serverSide]);
  
  // Paginate data (client-side)
  const paginatedData = useMemo(() => {
    if (serverSide) return sortedData;
    
    const start = (page - 1) * actualPageSize;
    return sortedData.slice(start, start + actualPageSize);
  }, [sortedData, page, actualPageSize, serverSide]);
  
  // Total count
  const totalCount = totalItems ?? filteredData.length;
  const totalPages = Math.ceil(totalCount / actualPageSize);
  
  // Handlers
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;
    
    let newDirection: SortDirection = 'asc';
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') newDirection = null;
    }
    
    setSortColumn(newDirection ? columnId : null);
    setSortDirection(newDirection);
    onSort?.(columnId, newDirection);
  }, [sortable, columns, sortColumn, sortDirection, onSort]);
  
  const handlePageChange = useCallback((newPage: number) => {
    if (serverSide) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  }, [serverSide, onPageChange]);
  
  const handlePageSizeChange = useCallback((newSize: number) => {
    if (serverSide) {
      onPageSizeChange?.(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  }, [serverSide, onPageSizeChange]);
  
  const handleSearch = useCallback((value: string) => {
    if (serverSide) {
      onSearch?.(value);
    } else {
      setInternalSearchValue(value);
      setInternalPage(1);
    }
  }, [serverSide, onSearch]);
  
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) {
      if (actualSelectedKeys.size === paginatedData.length) {
        setInternalSelectedKeys(new Set());
      } else {
        setInternalSelectedKeys(new Set(paginatedData.map(keyExtractor)));
      }
    } else {
      if (actualSelectedKeys.size === paginatedData.length) {
        onSelectionChange(new Set());
      } else {
        onSelectionChange(new Set(paginatedData.map(keyExtractor)));
      }
    }
  }, [actualSelectedKeys, paginatedData, keyExtractor, onSelectionChange]);
  
  const handleSelectRow = useCallback((key: string) => {
    const newKeys = new Set(actualSelectedKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    
    if (onSelectionChange) {
      onSelectionChange(newKeys);
    } else {
      setInternalSelectedKeys(newKeys);
    }
  }, [actualSelectedKeys, onSelectionChange]);
  
  const handleExpandRow = useCallback((key: string) => {
    const newKeys = new Set(actualExpandedKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    
    if (onExpand) {
      onExpand(newKeys);
    } else {
      setInternalExpandedKeys(newKeys);
    }
  }, [actualExpandedKeys, onExpand]);
  
  const isAllSelected = actualSelectedKeys.size === paginatedData.length && paginatedData.length > 0;
  const isIndeterminate = actualSelectedKeys.size > 0 && actualSelectedKeys.size < paginatedData.length;
  
  return (
    <div className={cn('w-full', className)}>
      {/* Search and Filter Bar */}
      {searchable && (
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              clearable
              onClear={() => handleSearch('')}
            />
          </div>
          {actualSelectedKeys.size > 0 && (
            <span className="text-sm text-neutral-500">
              {actualSelectedKeys.size} selected
            </span>
          )}
        </div>
      )}
      
      {/* Table Container */}
      <div 
        className={cn(
          'relative overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-700',
          stickyHeader && 'max-h-[600px]',
        )}
        style={{ maxHeight }}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center z-10">
            <Spinner size="lg" />
          </div>
        )}
        
        <table className="w-full">
          {/* Header */}
          <thead className={cn(
            'bg-neutral-50 dark:bg-neutral-800',
            stickyHeader && 'sticky top-0 z-10',
            headerClassName
          )}>
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className={cn(
                  'w-12 px-4 py-3 text-left',
                  bordered && 'border-r border-neutral-200 dark:border-neutral-700'
                )}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              
              {/* Expand Column */}
              {expandable && (
                <th className="w-12 px-4 py-3" />
              )}
              
              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                    'text-neutral-500 dark:text-neutral-400',
                    column.sortable && sortable && 'cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    bordered && 'border-r border-neutral-200 dark:border-neutral-700 last:border-r-0',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && sortable && (
                      <SortIcon 
                        direction={sortColumn === column.id ? sortDirection : null}
                        active={sortColumn === column.id}
                      />
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions Column */}
              {actionsColumn && actions && (
                <th className="w-24 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={
                    columns.length + 
                    (selectable ? 1 : 0) + 
                    (expandable ? 1 : 0) + 
                    (actionsColumn ? 1 : 0)
                  }
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    {emptyIcon || <Filter className="w-8 h-8" />}
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const key = keyExtractor(row);
                const isSelected = actualSelectedKeys.has(key);
                const isExpanded = actualExpandedKeys.has(key);
                const rowClass = typeof rowClassName === 'function' 
                  ? rowClassName(row, rowIndex) 
                  : rowClassName;
                
                return (
                  <React.Fragment key={key}>
                    <tr
                      className={cn(
                        'bg-white dark:bg-neutral-900',
                        striped && rowIndex % 2 === 1 && 'bg-neutral-50 dark:bg-neutral-800/50',
                        hoverable && 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                        isSelected && 'bg-primary-50 dark:bg-primary-900/10',
                        rowClass
                      )}
                    >
                      {/* Selection Checkbox */}
                      {selectable && (
                        <td className={cn(
                          'w-12 px-4 py-3',
                          bordered && 'border-r border-neutral-100 dark:border-neutral-800'
                        )}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                      )}
                      
                      {/* Expand Button */}
                      {expandable && (
                        <td className="w-12 px-4 py-3">
                          <button
                            onClick={() => handleExpandRow(key)}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      
                      {/* Data Cells */}
                      {columns.map((column) => {
                        const value = typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : row[column.accessor as keyof T];
                        
                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'px-4 py-3 text-sm',
                              'text-neutral-700 dark:text-neutral-300',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              compact ? 'py-2' : 'py-3',
                              bordered && 'border-r border-neutral-100 dark:border-neutral-800 last:border-r-0',
                              cellClassName,
                              column.cellClassName
                            )}
                            style={{ width: column.width }}
                          >
                            {column.cell ? column.cell(value, row, rowIndex) : value as ReactNode}
                          </td>
                        );
                      })}
                      
                      {/* Actions */}
                      {actionsColumn && actions && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {actions.view && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => actions.view!(row)}
                                aria-label="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {actions.edit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => actions.edit!(row)}
                                aria-label="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {actions.delete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => actions.delete!(row)}
                                aria-label="Delete"
                                className="text-error-600 hover:text-error-700 hover:bg-error-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            {actions.custom?.map((action, idx) => {
                              if (action.show && !action.show(row)) return null;
                              return (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => action.onClick(row)}
                                  aria-label={action.label}
                                  className={action.className}
                                >
                                  {action.icon || <MoreHorizontal className="w-4 h-4" />}
                                </Button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                    
                    {/* Expanded Content */}
                    {expandable && isExpanded && renderExpanded && (
                      <tr className="bg-neutral-50 dark:bg-neutral-800/30">
                        <td 
                          colSpan={
                            columns.length + 
                            (selectable ? 1 : 0) + 
                            (expandable ? 1 : 0) + 
                            (actionsColumn ? 1 : 0)
                          }
                          className="px-4 py-4"
                        >
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Show</span>
            <select
              value={actualPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
            <span className="hidden sm:inline ml-4">
              Showing {((page - 1) * actualPageSize) + 1} to {Math.min(page * actualPageSize, totalCount)} of {totalCount}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[32px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;