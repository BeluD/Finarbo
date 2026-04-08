'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeButton({ portfolioId }: { portfolioId: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/analyze`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al analizar')
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="btn btn-filled btn-sm"
        style={{ flexShrink: 0 }}
      >
        {loading
          ? <><i className="fa-solid fa-spinner fa-spin" /> Analizando...</>
          : <><i className="fa-solid fa-bolt" /> Analizar</>
        }
      </button>
      {error && (
        <p className="t-small" style={{ color: '#EF4444' }}>{error}</p>
      )}
    </div>
  )
}
