import { useNavigate, useParams } from 'react-router-dom'
import { getActivityById } from '../data/activities'

export default function LogFormScreen() {
  const navigate = useNavigate()
  const { actId } = useParams()
  const activity = getActivityById(actId)

  return (
    <div className='min-h-dvh flex items-center justify-center px-4' style={{ background: 'var(--bg)' }}>
      <div
        className='w-full max-w-md rounded-3xl p-6'
        style={{
          background: 'rgba(3,10,38,0.92)',
          border: '1px solid #1d2a55',
        }}
      >
        <h1 className='m-0 text-2xl font-semibold'>{activity?.name || 'Activity Form'}</h1>
        <p className='mt-2 text-sm' style={{ color: 'var(--muted)' }}>
          Form wiring is next. The selected church context from Home is already persisted for submission.
        </p>
        <button
          type='button'
          onClick={() => navigate('/home')}
          className='mt-4 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer'
          style={{
            color: 'var(--text)',
            background: 'var(--accent)',
            border: '1px solid #5f8cff',
          }}
        >
          Back Home
        </button>
      </div>
    </div>
  )
}
