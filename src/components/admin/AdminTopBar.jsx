// src/components/admin/AdminTopBar.jsx
// Top navigation bar shared across all admin screens.

import { useNavigate } from 'react-router-dom'
import { adminLogout } from '../../utils/adminAuth'

/**
 * @param {string}  title      — page title (e.g. "Colossians Stream")
 * @param {boolean} showBack   — show back chevron (default true)
 * @param {string}  backHref   — override for back destination
 */
export default function AdminTopBar({ title, showBack = true, backHref }) {
  const navigate = useNavigate()

  function handleBack() {
    if (backHref) navigate(backHref)
    else navigate(-1)
  }

  function handleLogout() {
    adminLogout()
    navigate('/admin')
  }

  return (
    <div
      className='sticky top-0 z-20 flex items-center gap-3 px-4 py-3'
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className='flex items-center justify-center rounded-lg p-1.5 -ml-1.5'
          style={{ color: 'var(--accent)' }}
          aria-label='Back'
        >
          <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path
              d='M12 5l-5 5 5 5'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      )}

      <h1
        className='flex-1 text-base font-semibold truncate'
        style={{ color: 'var(--text)' }}
      >
        {title}
      </h1>

      <button
        onClick={handleLogout}
        className='text-xs px-2.5 py-1.5 rounded-lg shrink-0'
        style={{
          background: 'var(--bg2)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        Sign out
      </button>
    </div>
  )
}
