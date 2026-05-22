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
import AdminGuard from './screens/admin/AdminGuard'
import AdminLoginScreen from './screens/admin/AdminLoginScreen'
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen'
import StreamOverviewScreen from './screens/admin/StreamOverviewScreen'
import CouncilScreen from './screens/admin/CouncilScreen'
import GovernorshipScreen from './screens/admin/GovernorshipScreen'
import LeaderDetailScreen from './screens/admin/LeaderDetailScreen'
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

          {/* Admin — login is unguarded; all others require admin session */}
          <Route path='/admin' element={<AdminLoginScreen />} />
          <Route element={<AdminGuard />}>
            <Route path='/admin/dashboard' element={<AdminDashboardScreen />} />
            <Route
              path='/admin/stream/:streamId'
              element={<StreamOverviewScreen />}
            />
            <Route
              path='/admin/council/:councilId'
              element={<CouncilScreen />}
            />
            <Route path='/admin/gov/:govId' element={<GovernorshipScreen />} />
            <Route
              path='/admin/leader/:userId'
              element={<LeaderDetailScreen />}
            />
          </Route>

          {/* Legacy redirects */}
          <Route path='/home' element={<Navigate to='/timeline' replace />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </TokenGuard>
    </BrowserRouter>
  )
}
