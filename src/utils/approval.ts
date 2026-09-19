export type LeaveType = 'พักร้อน' | 'ป่วย' | 'กิจ' | string;

export interface LeaveRequestItem {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  approverId?: number;
  isEscalated?: boolean;
  escalatedAt?: string;
}

/**
 * ⭐ แก้: บังคับ field ให้ครบ (position, leaveBalance, approverId, email)
 * เพื่อให้ LeaveForm.tsx ใช้ user.leaveBalance ได้โดยไม่ error
 */
export interface CurrentUser {
  id: number;
  name: string;
  role: 'employee' | 'manager' | 'hr_admin' | 'top_management';
  department: string;
  position: string;
  leaveBalance: number;
  approverId: number | null;
  email: string;
}

export const ESCALATION_DAYS = 2;

export function isRequestOverdue(
  dateStr: string,
  thresholdDays = ESCALATION_DAYS
): boolean {
  if (!dateStr) return false;
  const createdTime = new Date(dateStr).getTime();
  const nowTime = new Date().getTime();
  if (isNaN(createdTime)) return false;
  return (nowTime - createdTime) / (1000 * 60 * 60 * 24) >= thresholdDays;
}

export function canApprove(request: any, user: any): boolean {
  if (!user || !request) return false;
  if (request.employeeId === user.id) return false;
  if (user.role === 'hr_admin') return true;
  if (user.role === 'manager') {
    return (
      request.approverId === user.id ||
      request.department === user.department
    );
  }
  return false;
}

/**
 * ⭐ แก้: เพิ่มพารามิเตอร์ที่ 3 `employees` (optional)
 * เพื่อให้ ApprovalActions.tsx ส่ง employees เข้ามาได้
 * และใช้แสดงชื่อผู้อนุมัติที่ถูกต้องในข้อความ block
 */
export function getApprovalBlockReason(
  request: any,
  user: any,
  employees: CurrentUser[] = []
): string | null {
  if (!user || !request) return 'ไม่พบข้อมูลผู้ใช้';

  if (request.employeeId === user.id) {
    const approver = employees.find((e) => e.id === request.approverId);
    const approverName = approver
      ? `${approver.name}${approver.position ? ` (${approver.position})` : ''}`
      : 'ผู้อนุมัติที่กำหนด';
    return `⚠️ ไม่สามารถอนุมัติคำขอลาของตนเองได้ กรุณารอ ${approverName} ดำเนินการ`;
  }

  if (!canApprove(request, user)) {
    const approver = employees.find((e) => e.id === request.approverId);
    return approver
      ? `⚠️ คุณไม่ใช่ผู้อนุมัติคำขอนี้ (ผู้อนุมัติคือ ${approver.name})`
      : '⚠️ ไม่มีสิทธิ์อนุมัติคำขอนี้';
  }

  return null;
}

export function getRequestsToApprove(
  leaveRequests: any[],
  currentUser: CurrentUser | null
): any[] {
  if (!currentUser) return [];

  return leaveRequests.filter((req) => {
    if (req.status !== 'pending') return false;
    if (req.employeeId === currentUser.id) return false;

    if (currentUser.role === 'hr_admin') {
      return (
        Boolean(req.isEscalated) ||
        req.department === currentUser.department ||
        req.approverId === currentUser.id
      );
    }

    if (currentUser.role === 'manager') {
      return (
        (req.approverId && req.approverId === currentUser.id) ||
        req.department === currentUser.department
      );
    }

    return false;
  });
}

export function getOwnRequests(
  leaveRequests: any[],
  currentUser: CurrentUser | null
): any[] {
  if (!currentUser) return [];
  return leaveRequests.filter((req) => req.employeeId === currentUser.id);
}