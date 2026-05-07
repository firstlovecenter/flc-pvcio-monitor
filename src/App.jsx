import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import ActivityPickerScreen from './screens/ActivityPickerScreen'
import LogFormScreen from './screens/LogFormScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginScreen />} />
        <Route path='/home' element={<HomeScreen />} />
        <Route path='/pick/:cat' element={<ActivityPickerScreen />} />
        <Route path='/log/:actId' element={<LogFormScreen />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
