'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface AdminDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'Aucune donnée',
  onRowClick,
  className = ''
}: AdminDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0

    const aValue = a[sortKey as keyof T]
    const bValue = b[sortKey as keyof T]

    if (aValue === bValue) return 0

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null
    if (sortDirection === 'asc') return <ChevronUp size={14} />
    return <ChevronDown size={14} />
  }

  const getValue = (item: T, key: string) => {
    const keys = key.split('.')
    return keys.reduce((obj, k) => obj?.[k as keyof any] as any, item as any)
  }

  return (
    <div className={`table-wrapper ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={column.sortable ? 'cursor-pointer' : ''}
                onClick={() => column.sortable && handleSort(String(column.key))}
                style={{ cursor: column.sortable ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {column.label}
                  {column.sortable && (
                    <span style={{ opacity: 0.6 }}>
                      {getSortIcon(String(column.key))}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="admin-empty-state">
                  <div className="admin-empty-state-text">{emptyMessage}</div>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : getValue(item, String(column.key))}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
