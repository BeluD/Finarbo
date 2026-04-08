'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut }          from 'next-auth/react'
import Link                             from 'next/link'
import FinarboLogo                      from '@/components/ui/FinarboLogo'

export default function AppHeader() {
  const { data: session }          = useSession()
  const user                       = session?.user
  const [open, setOpen]            = useState(false)
  const dropdownRef                = useRef<HTMLDivElement>(null)

  const initials = [user?.name?.[0], user?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?'

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <header style={{
      position:       'sticky',
      top:            0,
      zIndex:         100,
      height:         '60px',
      background:     'rgba(9,9,14,0.90)',
      backdropFilter: 'blur(12px)',
      borderBottom:   '1px solid var(--border)',
      padding:        '0 32px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/home" style={{ textDecoration: 'none', display: 'inline-flex' }}>
        <FinarboLogo isotipoHeight={22} />
      </Link>

      {/* Avatar + dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Menú de usuario"
          aria-expanded={open}
          style={{
            width:          '36px',
            height:         '36px',
            borderRadius:   '50%',
            background:     user?.image ? 'transparent' : 'var(--grad-brand)',
            border:         open ? '2px solid var(--green-core)' : '2px solid transparent',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'pointer',
            overflow:       'hidden',
            padding:        0,
            transition:     'border-color 0.15s',
            flexShrink:     0,
          }}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#09090E', lineHeight: 1 }}>
              {initials}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position:     'absolute',
            top:          'calc(100% + 8px)',
            right:        0,
            minWidth:     '180px',
            background:   '#161820',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding:      '6px',
            boxShadow:    '0 8px 24px rgba(0,0,0,0.6)',
            zIndex:       200,
          }}>
            {/* User info */}
            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
              <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.2 }}>
                {user?.name} {user?.lastName}
              </p>
              <p className="t-small" style={{ color: 'var(--text-3)', marginTop: '2px' }}>{user?.email}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-1)', cursor: 'pointer',
              }}
              className="dropdown-item"
              >
                <i className="fa-solid fa-user" style={{ fontSize: '13px', width: '16px', color: 'var(--text-3)' }} />
                <span className="t-body">Perfil</span>
              </div>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                color: 'var(--danger)', cursor: 'pointer',
                width: '100%', background: 'none', border: 'none',
              }}
              className="dropdown-item"
            >
              <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '13px', width: '16px' }} />
              <span className="t-body">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
