import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { useEffect } from 'react'
import LoginScreen from './screens/LoginScreen'
import TimelineScreen from './screens/TimelineScreen'
import ActivityFormScreen from './screens/ActivityFormScreen'
import { isTokenExpired, refreshAccessToken, logout } from './utils/auth'

/** Silently refreshes the access token on mount if it's expired.
 *  Falls back to logout + redirect if the refresh token is also dead. */
function TokenGuard({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const isDemo = !!localStorage.getItem('demoUser')
    if (isDemo || !token) return // demo mode or not logged in — skip

    if (isTokenExpired(token)) {
      refreshAccessToken().catch(() => {
        logout()
        navigate('/', { replace: true })
      })
    }
  }, [navigate])

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <TokenGuard>
        <Routes>
          <Route path='/' element={<LoginScreen />} />
          <Route path='/timeline' element={<TimelineScreen />} />
          <Route path='/log/:actId' element={<ActivityFormScreen />} />
          {/* Legacy redirects */}
          <Route path='/home' element={<Navigate to='/timeline' replace />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </TokenGuard>
    </BrowserRouter>
  )
}
