"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, Search, Download } from "lucide-react";
import { Button } from "./Button";

export interface TableColumn<T> {
  key: string;
  header: string | React.ReactNode;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filterComponent?: React.ReactNode;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  showPagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Search...",
  filterable = false,
  filterComponent,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  showPagination = true,
  totalItems,
  currentPage = 1,
  onPageChange,
  className = "",
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const allRows = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortConfig.key];
        const bValue = (b as Record<string, unknown>)[sortConfig.key];

        if (aValue === bValue) return 0;

        const aStr = String(aValue ?? "");
        const bStr = String(bValue ?? "");
        
        const comparison = aStr.localeCompare(bStr);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return allRows;

    const start = (currentPage - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, currentPage, pageSize, showPagination]);

  const totalPages = useMemo(() => {
    const count = totalItems || allRows.length;
    return Math.ceil(count / pageSize);
  }, [allRows.length, pageSize, totalItems]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(paginatedData.map(keyExtractor));
    }
  };

  const handleSelectRow = (key: string) => {
    const newSelection = selectedRows.includes(key)
      ? selectedRows.filter((k) => k !== key)
      : [...selectedRows, key];
    onSelectionChange?.(newSelection);
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {(searchable || filterable) && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {filterable && filterComponent}
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.length === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-sm font-semibold text-slate-700
                    ${column.sortable ? "cursor-pointer hover:bg-slate-100" : ""}
                    ${column.align ? alignStyles[column.align] : "text-left"}
                    ${column.width ? column.width : ""}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span>
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const key = keyExtractor(row);
                const isSelected = selectedRows.includes(key);

                return (
                  <tr
                    key={key}
                    className={`
                      ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}
                      ${onRowClick ? "cursor-pointer" : ""}
                      transition-colors duration-150
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[column.key];
                      return (
                        <td
                          key={column.key}
                          className={`
                            px-4 py-3 text-sm text-slate-700
                            ${column.align ? alignStyles[column.align] : "text-left"}
                          `}
                        >
                          {column.render
                            ? column.render(value, row, index)
                            : String(value ?? "-")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems || allRows.length)} of{" "}
            {totalItems || allRows.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium
                      ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
