import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials, enrichUser, MOCK_USER } from '../utils/auth'

const DEMO_USERS = {
  bacenta: { ...MOCK_USER, roles: ['leaderBacenta'] },
  governorship: { ...MOCK_USER, roles: ['leaderGovernorship'] },
  oversight: { ...MOCK_USER, roles: ['leaderOversight', 'adminStream'] },
}

export default function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithCredentials(email, password)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  function handleDemo(role) {
    // For demo mode store a fake token so getCurrentUser() works downstream
    const user = enrichUser(DEMO_USERS[role])
    localStorage.setItem('demoUser', JSON.stringify(user))
    navigate('/home')
  }

  return (
    <div
      className='min-h-dvh flex items-center justify-center px-4'
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, #131929 0%, #0C0F1A 100%)',
      }}
    >
      <div
        className='w-full max-w-sm rounded-2xl p-8'
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight m-0 leading-none'>
            <span className='text-white'>PVCIO </span>
            <span
              style={{ color: 'var(--accent)' }}
              className='italic font-extrabold'
            >
              Monitor
            </span>
          </h1>
          <p
            className='text-xs mt-1 tracking-widest uppercase'
            style={{ color: 'var(--muted)' }}
          >
            Colossians Stream
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-1.5'>
            <label
              className='text-xs font-semibold tracking-widest uppercase'
              style={{ color: 'var(--muted)' }}
            >
              Email
            </label>
            <input
              type='email'
              autoComplete='email'
              placeholder='your@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors'
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-xs font-semibold tracking-widest uppercase'
              style={{ color: 'var(--muted)' }}
            >
              Password
            </label>
            <input
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors'
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p
              className='text-sm rounded-lg px-4 py-2.5 text-center'
              style={{
                color: 'var(--coral)',
                background: 'rgba(248,112,96,0.1)',
                border: '1px solid rgba(248,112,96,0.2)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60 cursor-pointer'
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo links */}
        <div className='mt-6 text-center'>
          <p className='text-xs mb-2' style={{ color: 'var(--muted)' }}>
            Don&apos;t have credentials yet? Try a demo:
          </p>
          <div className='flex justify-center gap-2 text-xs'>
            {[
              { role: 'bacenta', label: 'Bacenta Leader' },
              { role: 'governorship', label: 'Governor' },
              { role: 'oversight', label: 'Overseer' },
            ].map(({ role, label }, i) => (
              <span key={role} className='flex items-center gap-2'>
                {i > 0 && <span style={{ color: 'var(--border)' }}>·</span>}
                <button
                  type='button'
                  onClick={() => handleDemo(role)}
                  className='transition-opacity hover:opacity-80 cursor-pointer underline underline-offset-2'
                  style={{ color: 'var(--accent)' }}
                >
                  {label}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
