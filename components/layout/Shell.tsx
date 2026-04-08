import { ReactNode } from 'react'
import AppHeader     from './AppHeader'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <main
        id="main-content"
        style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '36px 32px 60px' }}
      >
        {children}
      </main>
    </div>
  )
}
