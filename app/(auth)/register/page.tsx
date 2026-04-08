'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name:            '',
    lastName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [errors,        setErrors]        = useState<Record<string, string>>({})
  const [serverError,   setServerError]   = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())     e.name     = 'Ingresá tu nombre.'
    if (!form.lastName.trim()) e.lastName = 'Ingresá tu apellido.'
    if (!form.email.includes('@')) e.email = 'Email inválido.'
    if (form.password.length < 8)  e.password = 'Mínimo 8 caracteres.'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name.trim(),
          lastName: form.lastName.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.error ?? 'Error al registrarse.'); return }

      // Auto-login after registration
      await signIn('credentials', {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      })
      router.push('/home')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/home' })
  }

  return (
    <div className="onb-card" style={{ width: '100%' }}>
      <h1 className="t-h2" style={{ color: 'var(--text-1)', marginBottom: '6px' }}>
        Creá tu cuenta
      </h1>
      <p className="t-small" style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--green-core)', textDecoration: 'none', fontWeight: 600 }}>
          Iniciá sesión
        </Link>
      </p>

      {serverError && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '16px' }}>
          <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="col" style={{ gap: '14px', marginBottom: '20px' }}>
          <div className="grid2">
            <div className="field">
              <label className="field-label" htmlFor="name">Nombre</label>
              <input
                id="name" type="text" className={`field-input${errors.name ? ' err' : ''}`}
                placeholder="Juan" value={form.name}
                onChange={e => set('name', e.target.value)} autoComplete="given-name"
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined}
              />
              {errors.name && <span className="field-err" id="err-name"><i className="fa-solid fa-circle-xmark" aria-hidden="true"/>{errors.name}</span>}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="lastName">Apellido</label>
              <input
                id="lastName" type="text" className={`field-input${errors.lastName ? ' err' : ''}`}
                placeholder="García" value={form.lastName}
                onChange={e => set('lastName', e.target.value)} autoComplete="family-name"
                aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'err-lastName' : undefined}
              />
              {errors.lastName && <span className="field-err" id="err-lastName"><i className="fa-solid fa-circle-xmark" aria-hidden="true"/>{errors.lastName}</span>}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email" type="email" className={`field-input${errors.email ? ' err' : ''}`}
              placeholder="tu@email.com" value={form.email}
              onChange={e => set('email', e.target.value)} autoComplete="email"
              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined}
            />
            {errors.email && <span className="field-err" id="err-email"><i className="fa-solid fa-circle-xmark" aria-hidden="true"/>{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password" type="password" className={`field-input${errors.password ? ' err' : ''}`}
              placeholder="Mínimo 8 caracteres" value={form.password}
              onChange={e => set('password', e.target.value)} autoComplete="new-password"
              aria-invalid={!!errors.password} aria-describedby={errors.password ? 'err-password' : undefined}
            />
            {errors.password && <span className="field-err" id="err-password"><i className="fa-solid fa-circle-xmark" aria-hidden="true"/>{errors.password}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password" type="password" className={`field-input${errors.confirmPassword ? ' err' : ''}`}
              placeholder="Repetí tu contraseña" value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)} autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'err-confirm' : undefined}
            />
            {errors.confirmPassword && <span className="field-err" id="err-confirm"><i className="fa-solid fa-circle-xmark" aria-hidden="true"/>{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="col" style={{ gap: '10px' }}>
          <button
            type="submit"
            className="btn btn-filled"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
