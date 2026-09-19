import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, StatCard } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { LeaveTypeBadge, StatusBadge } from '../components/Badge';
import { formatThaiDate, todayISO } from '../utils/date';
import { getStaffingSnapshot } from '../utils/staffing';

export default function ManagerDashboard() {
  const { user, departments, leaveRequests } = useApp();

  if (!user) return null;

  const today = todayISO();
  const dept = departments.find((d) => d.name === user.department);
  const snapshot = dept ? getStaffingSnapshot(dept, leaveRequests, today) : null;

  const pendingRequests = leaveRequests
    .filter((r) => r.status === 'pending' && r.department === user.department)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  const staffTone = snapshot?.isShort ? 'danger' : 'success';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`แดชบอร์ดหัวหน้าแผนก`}
        subtitle={`${user.name} · ${user.department} · ${formatThaiDate(today)}`}
        action={
          <Link
            to="/manager/approvals"
            className="relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-150 hover:bg-indigo-700 active:scale-95"
          >
            <span>อนุมัติคำขอลา</span>
            {pendingRequests.length > 0 ? (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                {pendingRequests.length}
              </span>
            ) : null}
          </Link>
        }
      />

      {/* กำลังคนของแผนก */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          สถานะกำลังคนแผนก {user.department} (วันนี้)
        </h2>

        {snapshot ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="พนักงานทั้งหมด"
              value={snapshot.totalEmployees}
              tone="default"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              label="ลาวันนี้"
              value={snapshot.onLeave}
              tone="warning"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              label="คงเหลือปฏิบัติงาน"
              value={snapshot.remaining}
              tone={staffTone}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <StatCard
              label="เกณฑ์ขั้นต่ำ"
              value={snapshot.minRequiredStaff}
              tone="default"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              hint={
                snapshot.isShort
                  ? '⚠️ ต่ำกว่าเกณฑ์ขั้นต่ำ!'
                  : 'กำลังคนพร้อมปฏิบัติงาน'
              }
            />
          </div>
        ) : (
          <Card>
            <p className="text-sm text-slate-500">ไม่พบข้อมูลแผนก</p>
          </Card>
        )}

        {snapshot?.isShort ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-900">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 font-bold text-rose-800">
              !
            </div>
            <p className="leading-relaxed">
              ขณะนี้แผนกของคุณมีพนักงานเหลือปฏิบัติงานเพียง <strong>{snapshot.remaining} คน</strong>{' '}
              ซึ่งต่ำกว่าเกณฑ์ขั้นต่ำ ({snapshot.minRequiredStaff} คน) โปรดระมัดระวังก่อนอนุมัติคำขอลาเพิ่มเติม
            </p>
          </div>
        ) : null}
      </section>

      {/* คำขอรออนุมัติ */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            คำขอรออนุมัติในแผนก
          </h2>
          {pendingRequests.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              {pendingRequests.length} รายการที่ต้องตรวจสอบ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              ✓ เคลียร์คำขอครบแล้ว
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            ไม่มีคำขอลาที่รอการอนุมัติในขณะนี้
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-slate-50/50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      {req.employeeName}
                    </p>
                    <LeaveTypeBadge type={req.leaveType} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        )}

        {pendingRequests.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link
              to="/manager/approvals"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              ไปยังหน้ารายการอนุมัติทั้งหมด <span>→</span>
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}