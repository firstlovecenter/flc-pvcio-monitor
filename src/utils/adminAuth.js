// src/utils/adminAuth.js
// Static shared-password admin session — sessionStorage only.
// Session ends when the browser tab closes.

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export function adminLogin(password) {
  if (password !== ADMIN_PASSWORD) throw new Error('Incorrect password')
  sessionStorage.setItem('adminAuth', 'true')
}

export function isAdminAuthed() {
  return sessionStorage.getItem('adminAuth') === 'true'
}

export function adminLogout() {
  sessionStorage.removeItem('adminAuth')
}
