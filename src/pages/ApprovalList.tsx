import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { LeaveTypeBadge } from '../components/Badge';
import { diffInDaysInclusive, formatThaiDate } from '../utils/date';
import { checkStaffingForRange } from '../utils/staffing';
import { getRequestsToApprove } from '../utils/approval';

export default function ApprovalList() {
  const { user, departments, leaveRequests, updateLeaveStatus } = useApp();
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.name, d] as const)),
    [departments]
  );

  // ดึงรายการคำขอที่ตนเองมีสิทธิ์อนุมัติ (กรองคำขอตนเองออกอัตโนมัติ)
  const pending = useMemo(() => {
    return getRequestsToApprove(leaveRequests, user).sort((a, b) =>
      a.startDate < b.startDate ? -1 : 1
    );
  }, [leaveRequests, user]);

  if (!user) return null;

  const handleDecision = (id: number, status: 'approved' | 'rejected') => {
    setBusyId(id);
    window.setTimeout(() => {
      const ok = updateLeaveStatus(id, status);
      setBusyId(null);
      if (ok) {
        showToast(
          status === 'approved' ? 'อนุมัติคำขอลาเรียบร้อยแล้ว ✅' : 'ปฏิเสธคำขอลาเรียบร้อยแล้ว',
          status === 'approved' ? 'success' : 'info'
        );
      }
    }, 400);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* ส่วนหัวหน้าเว็บ */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            อนุมัติคำขอลา
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === 'hr_admin' ? 'ภาพรวมที่รอ HR ดำเนินการ' : `แผนก ${user.department}`} · มี{' '}
            <span className="font-semibold text-indigo-600">{pending.length} คำขอ</span> ที่รอการตรวจสอบ
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            ✨
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">ไม่มีคำขอค้างอนุมัติ</h3>
          <p className="mt-1 text-sm text-slate-500">
            คำขอลาทั้งหมดได้รับการตรวจสอบและดำเนินการเรียบร้อยแล้ว
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((req) => {
            const dept = deptMap.get(req.department);
            const check = dept
              ? checkStaffingForRange(
                  dept,
                  req.employeeId,
                  req.startDate,
                  req.endDate,
                  leaveRequests,
                  req.id
                )
              : null;

            const days = diffInDaysInclusive(req.startDate, req.endDate);
            const busy = busyId === req.id;

            return (
              <div
                key={req.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                {/* แถบสีด้านซ้ายหากกระทบกำลังคน หรือเป็นเคส Escalated */}
                {req.isEscalated ? (
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-amber-500" />
                ) : check?.isShort ? (
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-rose-500" />
                ) : null}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    {/* ข้อมูลพนักงานและ Badge สถานะ */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                        {req.employeeName.charAt(0)}
                      </div>
                      <span className="text-base font-bold text-slate-900">
                        {req.employeeName}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {req.department}
                      </span>
                      <LeaveTypeBadge type={req.leaveType} />

                      {/* แสดง Flag พิเศษกรณี Escalated */}
                      {req.isEscalated && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 shadow-2xs">
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                          ⏰ เกินเวลา - รอ HR ช่วยอนุมัติ
                        </span>
                      )}

                      {check?.isShort && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                          ⚠️ กระทบกำลังคน
                        </span>
                      )}
                    </div>

                    {/* ช่วงวันที่ลา */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-600 sm:text-sm">
                      <div>
                        <span className="text-slate-400">ช่วงวันที่: </span>
                        <strong className="font-semibold text-slate-800">
                          {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">ระยะเวลา: </span>
                        <span className="font-bold text-indigo-600">{days} วัน</span>
                      </div>
                    </div>

                    {/* เหตุผลการลา */}
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold text-slate-500">เหตุผล: </span>
                      <span className="text-slate-800">{req.reason || '-'}</span>
                    </div>

                    {/* ข้อความเตือนอัตรากำลังคน */}
                    {check?.isShort && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900">
                        หากอนุมัติ แผนกจะเหลือกำลังคน{' '}
                        <strong>{check.minRemaining} คน</strong> ในวันที่{' '}
                        {check.shortDays.slice(0, 2).map((d) => formatThaiDate(d)).join(', ')}{' '}
                        (เกณฑ์ขั้นต่ำ {dept?.minRequiredStaff ?? '-'} คน)
                      </div>
                    )}
                  </div>

                  {/* ปุ่มคำสั่ง */}
                  <div className="flex shrink-0 gap-2.5 sm:w-32 sm:flex-col">
                    <button
                      type="button"
                      onClick={() => handleDecision(req.id, 'approved')}
                      disabled={busy}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-98 disabled:opacity-60"
                    >
                      {busy ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <span>✓ อนุมัติ</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(req.id, 'rejected')}
                      disabled={busy}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 hover:border-rose-200 active:scale-98 disabled:opacity-60"
                    >
                      ✕ ปฏิเสธ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}