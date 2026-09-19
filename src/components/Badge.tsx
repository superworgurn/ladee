import type { LeaveStatus, LeaveType, Role } from '../types';

const STATUS_STYLES: Record<LeaveStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
};
const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ',
};
const STATUS_DOTS: Record<LeaveStatus, string> = {
  pending: 'bg-amber-500', approved: 'bg-emerald-500', rejected: 'bg-rose-500',
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

const ROLE_STYLES: Record<Role, string> = {
  manager: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  employee: 'bg-slate-100 text-slate-700 ring-slate-200',
  hr_admin: 'bg-purple-100 text-purple-700 ring-purple-200',
  top_management: 'bg-amber-100 text-amber-800 ring-amber-300',
};
const ROLE_LABELS: Record<Role, string> = {
  manager: 'หัวหน้าแผนก',
  employee: 'พนักงาน',
  hr_admin: 'HR Admin',
  top_management: 'ผู้บริหาร',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

const LEAVE_TYPE_STYLES: Record<LeaveType, string> = {
  ป่วย: 'bg-rose-50 text-rose-700 ring-rose-200',
  กิจ: 'bg-sky-50 text-sky-700 ring-sky-200',
  พักร้อน: 'bg-violet-50 text-violet-700 ring-violet-200',
  คลอด: 'bg-pink-50 text-pink-700 ring-pink-200',
};

export function LeaveTypeBadge({ type }: { type: LeaveType }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${LEAVE_TYPE_STYLES[type]}`}>
      {type}
    </span>
  );
}

/* 🆕 Working status badge */
export function WorkingStatusBadge({ status }: { status: 'working' | 'on_leave' }) {
  return status === 'working' ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ทำงาน
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> ลา
    </span>
  );
}