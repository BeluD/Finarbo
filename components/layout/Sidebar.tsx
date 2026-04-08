'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import FinarboLogo from '@/components/ui/FinarboLogo'

const NAV_ITEMS = [
  { href: '/home',    label: 'Inicio',  icon: 'fa-house'  },
  { href: '/profile', label: 'Perfil',  icon: 'fa-user'   },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación principal"
      style={{
        width:          '220px',
        minHeight:      '100vh',
        background:     'var(--grad-sidebar)',
        borderRight:    '1px solid var(--border)',
        display:        'flex',
        flexDirection:  'column',
        padding:        '0',
        position:       'sticky',
        top:            0,
        flexShrink:     0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px' }}>
        <Link href="/home" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <FinarboLogo isotipoHeight={22} />
        </Link>
      </div>

      {/* Nav */}
      <div
        style={{
          padding: '4px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          flex: 1,
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" style={{ fontSize: '13px', width: '16px' }} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: '12px 12px 20px' }}>
        <button
          className="sb-item"
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ color: 'var(--danger)' }}
          aria-label="Cerrar sesión"
        >
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" style={{ fontSize: '13px', width: '16px' }} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
