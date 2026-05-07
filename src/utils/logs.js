// src/utils/logs.js
// CRUD for log entries — localStorage for now.
// Every function is designed to be swappable with API calls later.
// Look for TODO comments marking the swap points.

import { v4 as uuidv4 } from 'uuid'; // add uuid package: npm install uuid

const STORAGE_KEY = (userId) => `pvcio_logs_${userId}`;

// ── Read ──────────────────────────────────────────────────────────────────

/** Returns all logs for a user, newest first */
export function getLogs(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Returns logs filtered by category */
export function getLogsByCategory(userId, categoryId) {
  return getLogs(userId).filter(l => l.category === categoryId);
}

/** Returns logs filtered by activityId */
export function getLogsByActivity(userId, activityId) {
  return getLogs(userId).filter(l => l.activityId === activityId);
}

/** Returns the last N logs (default 20) for the home feed */
export function getRecentLogs(userId, n = 20) {
  return getLogs(userId).slice(0, n);
}

// ── Write ─────────────────────────────────────────────────────────────────

/**
 * Add a new log entry.
 * @param {string} userId
 * @param {object} entry - partial entry, id and submittedAt added automatically
 *
 * Entry shape:
 * {
 *   activityId: 'p1',
 *   activityName: 'Bacenta Prayer Meeting',
 *   category: 'prayer',
 *   level: 'bacenta',
 *   submittedBy: { userId, name, level, unitName, governorship, council, stream },
 *   fields: { attendance: 12, note: '...' }
 * }
 */
export function addLog(userId, entry) {
  const logs = getLogs(userId);
  const newEntry = {
    ...entry,
    id: uuidv4(),
    submittedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...logs];
  // TODO: replace localStorage.setItem with POST to API
  // await fetch('/api/logs', { method:'POST', body: JSON.stringify(newEntry) })
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(updated));
  return newEntry;
}

/** Delete a log entry by id */
export function deleteLog(userId, logId) {
  const updated = getLogs(userId).filter(l => l.id !== logId);
  // TODO: replace with DELETE /api/logs/:logId
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(updated));
}

// ── Export ────────────────────────────────────────────────────────────────

/** Returns all logs as a JSON string — for manual backup or future API sync */
export function exportLogs(userId) {
  return JSON.stringify(getLogs(userId), null, 2);
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Build the submittedBy block from the current user object.
 * Call this before addLog().
 */
export function buildSubmittedBy(user) {
  return {
    userId:       user.userId,
    name:         `${user.firstName} ${user.lastName}`,
    level:        user.level,
    unitName:     user.unitName,
    governorship: user.governorship?.name || null,
    council:      user.council?.name      || null,
    stream:       user.stream?.name       || null,
  };
}
