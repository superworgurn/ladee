import type { AttendanceRecord, AuditLog, Employee, LeaveRequest } from '../types';
import { EMPLOYEES } from '../data/employees';
import { LEAVE_REQUESTS } from '../data/leaveRequests';

const KEY_CURRENT_USER_ID = 'hr_currentUserId';
const KEY_EMPLOYEES = 'hr_employees';
const KEY_LEAVE_REQUESTS = 'hr_leaveRequests';
const KEY_ATTENDANCE = 'hr_attendance';
const KEY_AUDIT_LOGS = 'hr_auditLogs';
const KEY_VERSION = 'hr_schemaVersion';

/** Bump เมื่อ schema เปลี่ยน — จะ auto-reset localStorage */
const CURRENT_VERSION = 2;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** ตรวจ schema version — ถ้าไม่ตรงให้ reset ทั้งหมด */
export function ensureSchemaVersion(): boolean {
  const v = readJSON<number>(KEY_VERSION, 0);
  if (v !== CURRENT_VERSION) {
    resetAllData();
    writeJSON(KEY_VERSION, CURRENT_VERSION);
    return true;
  }
  return false;
}

/* ---------------- current user ---------------- */
export function getCurrentUserId(): number | null {
  return readJSON<number | null>(KEY_CURRENT_USER_ID, null);
}
export function setCurrentUserId(id: number): void {
  writeJSON(KEY_CURRENT_USER_ID, id);
}
export function clearCurrentUserId(): void {
  try { window.localStorage.removeItem(KEY_CURRENT_USER_ID); } catch { /* ignore */ }
}

/* ---------------- employees ---------------- */
export function getEmployees(): Employee[] {
  const stored = readJSON<Employee[] | null>(KEY_EMPLOYEES, null);
  if (stored === null || stored.length === 0) {
    writeJSON(KEY_EMPLOYEES, EMPLOYEES);
    return EMPLOYEES;
  }
  return stored;
}
export function saveEmployees(list: Employee[]): void {
  writeJSON(KEY_EMPLOYEES, list);
}

/* ---------------- leave requests ---------------- */
export function getLeaveRequests(): LeaveRequest[] {
  const stored = readJSON<LeaveRequest[] | null>(KEY_LEAVE_REQUESTS, null);
  if (stored === null) {
    writeJSON(KEY_LEAVE_REQUESTS, LEAVE_REQUESTS);
    return LEAVE_REQUESTS;
  }
  return stored;
}
export function saveLeaveRequests(list: LeaveRequest[]): void {
  writeJSON(KEY_LEAVE_REQUESTS, list);
}

/* ---------------- attendance ---------------- */
export function getAttendance(): AttendanceRecord[] {
  return readJSON<AttendanceRecord[]>(KEY_ATTENDANCE, []);
}
export function saveAttendance(list: AttendanceRecord[]): void {
  writeJSON(KEY_ATTENDANCE, list);
}

/* ---------------- audit logs ---------------- */
export function getAuditLogs(): AuditLog[] {
  return readJSON<AuditLog[]>(KEY_AUDIT_LOGS, []);
}
export function saveAuditLogs(list: AuditLog[]): void {
  writeJSON(KEY_AUDIT_LOGS, list);
}

/* ---------------- reset ---------------- */
export function resetAllData(): void {
  try {
    window.localStorage.removeItem(KEY_CURRENT_USER_ID);
    window.localStorage.removeItem(KEY_EMPLOYEES);
    window.localStorage.removeItem(KEY_LEAVE_REQUESTS);
    window.localStorage.removeItem(KEY_ATTENDANCE);
    window.localStorage.removeItem(KEY_AUDIT_LOGS);
  } catch { /* ignore */ }
}