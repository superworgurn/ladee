import type { Department, Employee, LeaveRequest } from '../types';
import { eachDayInRange, rangesOverlap } from './date';

export interface StaffingSnapshot {
  department: string;
  totalEmployees: number;
  minRequiredStaff: number;
  onLeave: number;
  remaining: number;
  isShort: boolean;
}

export interface RangeStaffingCheck {
  isShort: boolean;
  shortDays: string[];
  minRemaining: number;
}

export interface WorkingStatus {
  employee: Employee;
  status: 'working' | 'on_leave';
  leaveRequest?: LeaveRequest;
}

interface CountOptions {
  excludeRequestId?: number;
  includeEmployeeId?: number;
}

export function countEmployeesOnLeave(
  requests: LeaveRequest[],
  department: string,
  dateISO: string,
  options: CountOptions = {}
): number {
  const ids = new Set<number>();
  for (const r of requests) {
    if (r.status !== 'approved') continue;
    if (r.department !== department) continue;
    if (options.excludeRequestId !== undefined && r.id === options.excludeRequestId) continue;
    if (rangesOverlap(r.startDate, r.endDate, dateISO, dateISO)) ids.add(r.employeeId);
  }
  if (options.includeEmployeeId !== undefined) ids.add(options.includeEmployeeId);
  return ids.size;
}

export function getStaffingSnapshot(
  dept: Department,
  requests: LeaveRequest[],
  dateISO: string
): StaffingSnapshot {
  const onLeave = countEmployeesOnLeave(requests, dept.name, dateISO);
  const remaining = Math.max(0, dept.totalEmployees - onLeave);
  return {
    department: dept.name,
    totalEmployees: dept.totalEmployees,
    minRequiredStaff: dept.minRequiredStaff,
    onLeave,
    remaining,
    isShort: remaining < dept.minRequiredStaff,
  };
}

export function checkStaffingForRange(
  dept: Department,
  employeeId: number,
  startDate: string,
  endDate: string,
  requests: LeaveRequest[],
  excludeRequestId?: number
): RangeStaffingCheck {
  const days = eachDayInRange(startDate, endDate);
  const shortDays: string[] = [];
  let minRemaining = Number.POSITIVE_INFINITY;

  for (const day of days) {
    const onLeave = countEmployeesOnLeave(requests, dept.name, day, {
      excludeRequestId,
      includeEmployeeId: employeeId,
    });
    const remaining = Math.max(0, dept.totalEmployees - onLeave);
    if (remaining < minRemaining) minRemaining = remaining;
    if (remaining < dept.minRequiredStaff) shortDays.push(day);
  }

  if (!Number.isFinite(minRemaining)) minRemaining = dept.totalEmployees;

  return { isShort: shortDays.length > 0, shortDays, minRemaining };
}

/**
 * 🆕 คืนสถานะ "ใครทำงาน / ใครลา" ของพนักงานทุกคน (ยกเว้น top_management)
 * ใช้ approved leave requests เท่านั้น
 */
export function getWorkingStatusForDate(
  employees: Employee[],
  requests: LeaveRequest[],
  dateISO: string
): WorkingStatus[] {
  return employees
    .filter((e) => e.role !== 'top_management')
    .map((emp) => {
      const leave = requests.find(
        (r) =>
          r.employeeId === emp.id &&
          r.status === 'approved' &&
          rangesOverlap(r.startDate, r.endDate, dateISO, dateISO)
      );
      return {
        employee: emp,
        status: leave ? 'on_leave' : 'working',
        leaveRequest: leave,
      } satisfies WorkingStatus;
    })
    .sort((a, b) => {
      // เรียง: ลาก่อน แล้วค่อยทำงาน, แล้วตามชื่อ
      if (a.status !== b.status) return a.status === 'on_leave' ? -1 : 1;
      return a.employee.name.localeCompare(b.employee.name, 'th');
    });
}