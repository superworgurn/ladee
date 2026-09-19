import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Card, StatCard } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/Badge';
import { formatThaiDate, formatTime, todayISO } from '../utils/date';

export default function EmployeeDashboard() {
  const { user, leaveRequests, attendance, toggleAttendance } = useApp();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const today = todayISO();
  const record = attendance.find((a) => a.employeeId === user.id && a.date === today);

  const myRequests = leaveRequests.filter((r) => r.employeeId === user.id);
  const pendingCount = myRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = myRequests.filter((r) => r.status === 'approved').length;

  const checkedIn = Boolean(record?.checkIn);
  const checkedOut = Boolean(record?.checkOut);

  const handleToggle = () => {
    if (checkedOut) {
      showToast('วันนี้คุณเช็คเอาท์ไปแล้ว', 'info');
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      const action = toggleAttendance(user.id);
      setBusy(false);
      showToast(
        action === 'checkin' ? 'เช็คอินสำเร็จ 🎉' : 'เช็คเอาท์สำเร็จ 👋',
        'success'
      );
    }, 450);
  };

  const recent = myRequests.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`สวัสดี, ${user.name}`}
        subtitle={`${user.department} · ${formatThaiDate(today)}`}
      />

      {/* สรุปตัวเลข */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="วันลาคงเหลือ"
          value={`${user.leaveBalance} วัน`}
          tone="primary"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          hint="หักอัตโนมัติเมื่อคำขอถูกอนุมัติ"
        />
        <StatCard
          label="รออนุมัติ"
          value={`${pendingCount} รายการ`}
          tone={pendingCount > 0 ? 'warning' : 'default'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="อนุมัติแล้ว"
          value={`${approvedCount} รายการ`}
          tone="success"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* การ์ดเช็คอิน/เช็คเอาท์ */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                ลงเวลาทำงานวันนี้
              </h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                checkedOut 
                  ? 'bg-slate-100 text-slate-600' 
                  : checkedIn 
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  checkedOut ? 'bg-slate-400' : checkedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                {checkedOut ? 'สิ้นสุดงานแล้ว' : checkedIn ? 'กำลังทำงาน' : 'ยังไม่เริ่มงาน'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{formatThaiDate(today)}</p>

            <div className="mt-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  เช็คอิน
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-900">
                  {formatTime(record?.checkIn)}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  เช็คเอาท์
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-rose-900">
                  {formatTime(record?.checkOut)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleToggle}
              disabled={busy || checkedOut}
              className={[
                'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-150 active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                checkedIn
                  ? 'bg-rose-600 shadow-rose-500/25 hover:bg-rose-700 focus-visible:ring-rose-400'
                  : 'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700 focus-visible:ring-indigo-400',
              ].join(' ')}
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  กำลังบันทึก...
                </>
              ) : checkedOut ? (
                'เช็คเอาท์ครบแล้วสำหรับวันนี้'
              ) : checkedIn ? (
                'บันทึกเวลาออกงาน (Check Out)'
              ) : (
                'บันทึกเวลาเข้างาน (Check In)'
              )}
            </button>
          </div>
        </Card>

        {/* เมนูลัด */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">เมนูลัด</h2>
            <p className="mt-1 text-xs text-slate-500">
              จัดการคำขอลาและตรวจสอบประวัติย้อนหลัง
            </p>

            <div className="mt-5 space-y-3">
              <Link
                to="/leave/new"
                className="group flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 transition group-hover:scale-105">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      ขอลาหยุดงาน
                    </p>
                    <p className="text-xs text-slate-500">ส่งคำขอลาประเภทต่าง ๆ ให้หัวหน้าพิจารณา</p>
                  </div>
                </div>
                <span className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600">
                  →
                </span>
              </Link>

              <Link
                to="/leave/history"
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm transition group-hover:scale-105">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      ประวัติการลา
                    </p>
                    <p className="text-xs text-slate-500">ตรวจสอบสถานะคำขอทั้งหมดของคุณ</p>
                  </div>
                </div>
                <span className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600">
                  →
                </span>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* รายการล่าสุด */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold tracking-tight text-slate-900">คำขอลาล่าสุด</h2>
          <Link
            to="/leave/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">ยังไม่มีรายการคำขอลา</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5 transition-colors hover:bg-slate-50/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      ลา{req.leaveType}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400 max-w-md">
                    {req.reason}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}