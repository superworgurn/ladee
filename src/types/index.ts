export type LeaveType = 'ป่วย' | 'กิจ' | 'พักร้อน' | 'คลอด';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type Role = 'employee' | 'manager' | 'hr_admin' | 'top_management';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: Role;
  position: string;
  leaveBalance: number;
  approverId: number | null;
}

export type CurrentUser = Employee;

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days?: number;
  reason: string;
  status: LeaveStatus;
  approverId?: number | null;
  isEscalated?: boolean;
  createdAt?: string;
  rejectReason?: string;
}

export interface Department {
  name: string;
  totalEmployees: number;
  minRequiredStaff: number;
}

export interface AttendanceRecord {
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: 'approve' | 'reject' | 'edit';
  performedBy: number;
  performedByName: string;
  targetEmployeeName: string;
  targetLeaveRequestId: number;
  details?: string;
}