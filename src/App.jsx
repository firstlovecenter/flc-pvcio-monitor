import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import TimelineScreen from './screens/TimelineScreen'
import ActivityFormScreen from './screens/ActivityFormScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginScreen />} />
        <Route path='/timeline' element={<TimelineScreen />} />
        <Route path='/log/:actId' element={<ActivityFormScreen />} />
        {/* Legacy redirects */}
        <Route path='/home' element={<Navigate to='/timeline' replace />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
