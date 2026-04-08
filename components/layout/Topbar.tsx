import { auth } from '@/auth'

interface TopbarProps {
  breadcrumb?: string
}

export default async function Topbar({ breadcrumb }: TopbarProps) {
  const session = await auth()
  const user    = session?.user
  const initials = [user?.name?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <header
      style={{
        height:         '56px',
        position:       'sticky',
        top:            0,
        zIndex:         10,
        background:     'rgba(9,9,14,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom:   '1px solid var(--border)',
        padding:        '0 28px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            '16px',
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="t-small" style={{ color: 'var(--text-3)' }}>Inicio</span>
        {breadcrumb && (
          <>
            <span className="t-small" style={{ color: 'var(--text-3)' }}>›</span>
            <span className="t-small" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Avatar */}
        <div
          aria-label={`Usuario: ${user?.name ?? ''} ${user?.lastName ?? ''}`}
          title={`${user?.name ?? ''} ${user?.lastName ?? ''}`}
          style={{
            width:          '34px',
            height:         '34px',
            borderRadius:   '50%',
            background:     user?.image ? undefined : 'var(--grad-brand)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '12px',
            fontWeight:     700,
            color:          '#09090E',
            flexShrink:     0,
            overflow:       'hidden',
          }}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  )
}
