export type Role = 'employee' | 'manager' | 'hr_admin' | 'top_management';

export type LeaveType = 'ป่วย' | 'กิจ' | 'พักร้อน' | 'คลอด';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
  id: number;
  name: string;
  role: Role;
  department: string;
  leaveBalance: number;
  email: string;
  position: string;
  /** id ของคนที่อนุมัติคำขอลาของคนนี้ (null = ไม่ต้องอนุมัติ เช่น top management) */
  approverId: number | null;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  /** ผู้อนุมัติที่ถูกกำหนด ณ ตอนสร้างคำขอ */
  approverId: number | null;
}

export interface Department {
  name: string;
  totalEmployees: number;
  minRequiredStaff: number;
}

export interface AttendanceRecord {
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

export interface AuditLog {
  id: number;
  action: 'approve' | 'reject' | 'edit_balance';
  performedBy: number;
  performedByName: string;
  targetLeaveRequestId: number;
  targetEmployeeName: string;
  timestamp: string;
}