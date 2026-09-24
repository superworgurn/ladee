import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AttendanceRecord,
  AuditLog,
  Department,
  Employee,
  LeaveRequest,
  LeaveType,
} from '../types';
import { DEPARTMENTS } from '../data/departments';
import * as storage from '../utils/storage';
import { diffInDaysInclusive, todayISO } from '../utils/date';
import { canApprove } from '../utils/approval';

export interface NewLeaveRequestInput {
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  approverId: number | null;
}

export type AttendanceAction = 'checkin' | 'checkout';

interface AppContextValue {
  user: Employee | null;
  employees: Employee[];
  departments: Department[];
  leaveRequests: LeaveRequest[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLog[];

  login: (employeeId: number) => void;
  logout: () => void;
  addLeaveRequest: (input: NewLeaveRequestInput) => LeaveRequest;
  updateLeaveStatus: (
    requestId: number,
    status: 'approved' | 'rejected',
    reason?: string
  ) => boolean;
  toggleAttendance: (employeeId: number) => AttendanceAction;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ตรวจ schema version ครั้งแรก
  storage.ensureSchemaVersion();

  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    storage.getLeaveRequests()
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    storage.getAttendance()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [currentUserId, setCurrentUserId] = useState<number | null>(() =>
    storage.getCurrentUserId()
  );

  const user = useMemo(
    () => employees.find((e) => e.id === currentUserId) ?? null,
    [employees, currentUserId]
  );

  const login = useCallback((employeeId: number) => {
    storage.setCurrentUserId(employeeId);
    setCurrentUserId(employeeId);
  }, []);

  const logout = useCallback(() => {
    storage.clearCurrentUserId();
    setCurrentUserId(null);
  }, []);

  const addLeaveRequest = useCallback(
    (input: NewLeaveRequestInput): LeaveRequest => {
      const created: LeaveRequest = {
        id: Date.now(),
        ...input,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const next = [created, ...leaveRequests];
      setLeaveRequests(next);
      storage.saveLeaveRequests(next);
      return created;
    },
    [leaveRequests]
  );

  /**
   * ⭐ updateLeaveStatus — มีการ guard ด้วย canApprove()
   * และรองรับการบันทึก rejectReason เมื่อสถานะเป็น rejected
   */
  const updateLeaveStatus = useCallback(
    (
      requestId: number,
      status: 'approved' | 'rejected',
      reason?: string
    ): boolean => {
      const target = leaveRequests.find((r) => r.id === requestId);
      if (!target) return false;
      if (!user) return false;

      // 🔒 Guard: ต้องผ่าน canApprove เท่านั้น
      if (!canApprove(target, user)) {
        console.warn(
          '[BLOCKED] ไม่สามารถอนุมัติ/ปฏิเสธคำขอนี้ได้ — ต้องเป็น approverId ที่ไม่ใช่ตัวเอง'
        );
        return false;
      }

      const nextRequests = leaveRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              rejectReason: status === 'rejected' ? (reason || r.rejectReason) : undefined,
            }
          : r
      );
      setLeaveRequests(nextRequests);
      storage.saveLeaveRequests(nextRequests);

      // Audit log พร้อมบันทึกเหตุผล
      const log: AuditLog = {
        id: Date.now(),
        action: status === 'approved' ? 'approve' : 'reject',
        performedBy: user.id,
        performedByName: user.name,
        targetLeaveRequestId: target.id,
        targetEmployeeName: target.employeeName,
        timestamp: new Date().toISOString(),
        details:
          status === 'rejected' && reason
            ? `เหตุผลที่ไม่อนุมัติ: ${reason}`
            : undefined,
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      storage.saveAuditLogs(nextLogs);

      // ถ้าอนุมัติ → หักวันลาคงเหลือ
      if (status === 'approved') {
        const days = diffInDaysInclusive(target.startDate, target.endDate);
        const nextEmployees = employees.map((e) =>
          e.id === target.employeeId
            ? { ...e, leaveBalance: Math.max(0, e.leaveBalance - days) }
            : e
        );
        setEmployees(nextEmployees);
        storage.saveEmployees(nextEmployees);
      }

      return true;
    },
    [leaveRequests, employees, user, auditLogs]
  );

  const toggleAttendance = useCallback(
    (employeeId: number): AttendanceAction => {
      const today = todayISO();
      const nowIso = new Date().toISOString();
      const existing = attendance.find(
        (a) => a.employeeId === employeeId && a.date === today
      );

      if (!existing || !existing.checkIn) {
        const record: AttendanceRecord = {
          employeeId,
          date: today,
          checkIn: nowIso,
          checkOut: null,
        };
        const next = [
          ...attendance.filter(
            (a) => !(a.employeeId === employeeId && a.date === today)
          ),
          record,
        ];
        setAttendance(next);
        storage.saveAttendance(next);
        return 'checkin';
      }

      if (!existing.checkOut) {
        const next = attendance.map((a) =>
          a.employeeId === employeeId && a.date === today
            ? { ...a, checkOut: nowIso }
            : a
        );
        setAttendance(next);
        storage.saveAttendance(next);
        return 'checkout';
      }

      return 'checkout';
    },
    [attendance]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      employees,
      departments: DEPARTMENTS,
      leaveRequests,
      attendance,
      auditLogs,
      login,
      logout,
      addLeaveRequest,
      updateLeaveStatus,
      toggleAttendance,
    }),
    [
      user,
      employees,
      leaveRequests,
      attendance,
      auditLogs,
      login,
      logout,
      addLeaveRequest,
      updateLeaveStatus,
      toggleAttendance,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp ต้องถูกใช้ภายใน <AppProvider>');
  return ctx;
}