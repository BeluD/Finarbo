'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/home'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Email o contraseña incorrectos.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div
      className="onb-card"
      style={{ width: '100%' }}
    >
      <h1 className="t-h2" style={{ color: 'var(--text-1)', marginBottom: '6px' }}>
        Iniciá sesión
      </h1>
      <p className="t-small" style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/register" style={{ color: 'var(--green-core)', textDecoration: 'none', fontWeight: 600 }}>
          Registrate
        </Link>
      </p>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '16px' }}>
          <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="col" style={{ gap: '14px', marginBottom: '20px' }}>
          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div className="col" style={{ gap: '10px' }}>
          <button
            type="submit"
            className="btn btn-filled"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span className="t-small" style={{ color: 'var(--text-3)' }}>o</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <i className="fa-brands fa-google" aria-hidden="true" />
            {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-2)' }}>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
