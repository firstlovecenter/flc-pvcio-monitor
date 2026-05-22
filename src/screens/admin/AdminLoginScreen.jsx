// src/screens/admin/AdminLoginScreen.jsx
// Simple shared-password login for the admin dashboard.
// On success → /admin/dashboard

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../utils/adminAuth'

export default function AdminLoginScreen() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      adminLogin(password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Incorrect password')
    } finally {
      setLoading(false)
    }
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
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight m-0 leading-none'>
            <span className='text-white'>PVCIO </span>
            <span
              style={{ color: 'var(--accent)' }}
              className='italic font-extrabold'
            >
              Admin
            </span>
          </h1>
          <p
            className='text-xs mt-1 tracking-widest uppercase'
            style={{ color: 'var(--muted)' }}
          >
            Compliance Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
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
              placeholder='Enter admin password'
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
              className='text-xs rounded-lg px-3 py-2'
              style={{ background: 'rgba(248,112,96,.12)', color: '#F87060' }}
            >
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50'
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {loading ? 'Checking…' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
