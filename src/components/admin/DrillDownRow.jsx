// src/components/admin/DrillDownRow.jsx
// Reusable list row: name + sub-name + compliance bar + arrow.
// Tapping navigates to the next drill-down level.

import { useNavigate } from 'react-router-dom'
import ComplianceBar from './ComplianceBar'
import { complianceStatus } from '../../utils/compliance'

/**
 * @param {string}   title      — primary label (council / gov / bacenta name)
 * @param {string}   subtitle   — secondary label (leader name)
 * @param {number}   pct        — 0–100
 * @param {number}   filled     — filled count
 * @param {number}   total      — expected count
 * @param {string}   href       — path to navigate to on tap
 * @param {boolean}  inProgress — show "In progress" badge instead of label
 */
export default function DrillDownRow({
  title,
  subtitle,
  pct,
  filled,
  total,
  href,
  inProgress = false,
}) {
  const navigate = useNavigate()
  const { label, color } = complianceStatus(pct)

  return (
    <button
      onClick={() => navigate(href)}
      className='w-full text-left flex items-center gap-3 px-4 py-3 transition-colors'
      style={{ background: 'transparent' }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Text block */}
      <div className='flex-1 min-w-0'>
        <p
          className='text-sm font-semibold truncate'
          style={{ color: 'var(--text)' }}
        >
          {title}
        </p>
        {subtitle && (
          <p className='text-xs truncate' style={{ color: 'var(--muted)' }}>
            {subtitle}
          </p>
        )}
        <div className='mt-2'>
          <ComplianceBar
            pct={pct}
            filled={filled}
            total={total}
            showLabel={false}
            size='sm'
          />
        </div>
      </div>

      {/* Right side: pct + label + arrow */}
      <div className='flex flex-col items-end shrink-0 gap-0.5 ml-2'>
        <span className='text-sm font-bold tabular-nums' style={{ color }}>
          {pct}%
        </span>
        <span
          className='text-xs'
          style={{ color: inProgress ? 'var(--muted)' : color }}
        >
          {inProgress ? 'In progress' : label}
        </span>
      </div>

      {/* Arrow */}
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        style={{ color: 'var(--muted)', flexShrink: 0 }}
      >
        <path
          d='M6 3l5 5-5 5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  )
}
