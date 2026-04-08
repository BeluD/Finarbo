'use client'

import { useState }                      from 'react'
import Link                              from 'next/link'
import PortfolioCard, { PortfolioCardData } from './PortfolioCard'
import PortfolioRow, { PortfolioTableHeader } from './PortfolioRow'

interface PortfolioListProps {
  portfolios: PortfolioCardData[]
}

type View = 'grid' | 'list'

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={typeof children === 'string' ? children : undefined}
      style={{
        width:          '34px',
        height:         '34px',
        borderRadius:   'var(--radius-md)',
        border:         `1px solid ${active ? 'var(--green-core)' : 'var(--border-subtle)'}`,
        background:     active ? 'var(--green-soft)' : 'transparent',
        color:          active ? 'var(--green-core)' : 'var(--text-3)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        transition:     'all 0.15s',
        padding:        0,
      }}
    >
      {children}
    </button>
  )
}

export default function PortfolioList({ portfolios }: PortfolioListProps) {
  const [view, setView] = useState<View>('grid')

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <ToggleBtn active={view === 'grid'} onClick={() => setView('grid')}>
            <i className="fa-solid fa-table-cells" style={{ fontSize: '13px' }} />
          </ToggleBtn>
          <ToggleBtn active={view === 'list'} onClick={() => setView('list')}>
            <i className="fa-solid fa-list-ul" style={{ fontSize: '13px' }} />
          </ToggleBtn>
        </div>

        {/* Nueva cartera */}
        <Link href="/portfolio/new" className="btn btn-filled btn-sm">
          <i className="fa-solid fa-plus" /> Nueva cartera
        </Link>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap:                 '16px',
        }}>
          {portfolios.map(p => <PortfolioCard key={p.id} {...p} />)}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{
          background:   'var(--grad-dark)',
          border:       '1px solid var(--border-md)',
          borderRadius: 'var(--r-2xl)',
          overflow:     'hidden',
        }}>
          <PortfolioTableHeader />
          {portfolios.map(p => <PortfolioRow key={p.id} {...p} />)}
        </div>
      )}
    </>
  )
}
