// src/screens/admin/AdminGuard.jsx
// Protects all /admin/* routes — redirects to /admin if not authed.

import { Navigate, Outlet } from 'react-router-dom'
import { isAdminAuthed } from '../../utils/adminAuth'

export default function AdminGuard() {
  if (!isAdminAuthed()) return <Navigate to='/admin' replace />
  return <Outlet />
}
