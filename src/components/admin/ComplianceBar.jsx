// src/components/admin/ComplianceBar.jsx
// Reusable progress bar showing compliance percentage + label.

import { complianceStatus } from '../../utils/compliance'

/**
 * @param {number} pct       — 0–100
 * @param {number} filled    — count of filled activities (optional)
 * @param {number} total     — total expected activities (optional)
 * @param {boolean} showLabel — show text label next to bar (default true)
 * @param {'sm'|'md'} size   — bar height (default 'md')
 */
export default function ComplianceBar({
  pct,
  filled,
  total,
  showLabel = true,
  size = 'md',
}) {
  const { label, color } = complianceStatus(pct)
  const h = size === 'sm' ? 4 : 6

  return (
    <div className='flex flex-col gap-1 w-full'>
      {/* Numbers row */}
      {filled !== undefined && total !== undefined && (
        <div className='flex items-center justify-between'>
          <span className='text-xs' style={{ color: 'var(--muted)' }}>
            {filled}/{total} filled
          </span>
          <span className='text-xs font-semibold' style={{ color }}>
            {pct}%
          </span>
        </div>
      )}

      {/* Bar */}
      <div
        className='w-full rounded-full overflow-hidden'
        style={{ height: h, background: 'var(--border)' }}
      >
        <div
          className='h-full rounded-full transition-all duration-300'
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className='text-xs' style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}
