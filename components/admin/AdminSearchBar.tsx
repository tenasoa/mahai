'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface AdminSearchBarProps {
  placeholder?: string
  paramName?: string
  debounceMs?: number
}

export function AdminSearchBar({
  placeholder = 'Rechercher…',
  paramName = 'q',
  debounceMs = 400,
}: AdminSearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initial = searchParams.get(paramName) ?? ''
  const [value, setValue] = useState(initial)

  useEffect(() => {
    setValue(searchParams.get(paramName) ?? '')
  }, [searchParams, paramName])

  useEffect(() => {
    const handler = setTimeout(() => {
      const current = searchParams.get(paramName) ?? ''
      if (value === current) return

      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(paramName, value)
      } else {
        params.delete(paramName)
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [value, paramName, searchParams, pathname, router, debounceMs])

  return (
    <div className="admin-search-bar">
      <Search size={16} className="admin-search-bar-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="admin-search-bar-input"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="admin-search-bar-clear"
          aria-label="Effacer la recherche"
        >
          <X size={14} />
        </button>
      )}
      <style jsx>{`
        .admin-search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface);
          border: 1px solid var(--b2);
          border-radius: var(--r);
          padding: 0.55rem 0.9rem;
          width: 100%;
          max-width: 420px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-search-bar:focus-within {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-dim);
        }
        .admin-search-bar-icon {
          color: var(--text-3);
          flex-shrink: 0;
        }
        .admin-search-bar-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--body);
          font-size: 0.88rem;
          min-width: 0;
        }
        .admin-search-bar-input::placeholder {
          color: var(--text-3);
        }
        .admin-search-bar-clear {
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          padding: 0.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.2s, background 0.2s;
        }
        .admin-search-bar-clear:hover {
          color: var(--text);
          background: var(--b2);
        }
      `}</style>
    </div>
  )
}
