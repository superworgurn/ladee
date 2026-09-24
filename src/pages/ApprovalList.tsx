import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { LeaveTypeBadge } from '../components/Badge';
import { AttendanceModal } from '../components/AttendanceModal';
import { diffInDaysInclusive, formatThaiDate } from '../utils/date';
import { checkStaffingForRange } from '../utils/staffing';
import { getRequestsToApprove } from '../utils/approval';

type FilterTab = 'all' | 'manager_to_hr' | 'employee_to_manager';

export default function ApprovalList() {
  const { user, employees, departments, leaveRequests, updateLeaveStatus } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectingEmp, setInspectingEmp] = useState<{ id: number; name: string } | null>(null);

  if (!user) return null;

  const isHR = user.role === 'hr_admin' || user.role === 'top_management';

  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.name, d] as const)),
    [departments]
  );

  // ดึงรายการคำขอทั้งหมดที่อยู่ในสิทธิ์ของ Role ปัจจุบัน
  const pending = useMemo(() => {
    return getRequestsToApprove(leaveRequests, user).sort((a, b) =>
      a.startDate < b.startDate ? -1 : 1
    );
  }, [leaveRequests, user]);

  const getRequester = (employeeId: number) => {
    return employees.find((e) => e.id === employeeId);
  };

  // 1. คำขอจากหัวหน้าแผนก (Manager ส่งต่อให้ HR พิจารณา)
  const managerToHrRequests = useMemo(() => {
    return pending.filter((req) => {
      const requester = getRequester(req.employeeId);
      return requester?.role === 'manager';
    });
  }, [pending, employees]);

  // 2. คำขอจากพนักงานทั่วไป (Employee ส่งหาหัวหน้าแผนก)
  const employeeToManagerRequests = useMemo(() => {
    return pending.filter((req) => {
      const requester = getRequester(req.employeeId);
      return requester?.role !== 'manager';
    });
  }, [pending, employees]);

  // กรองตามแท็บที่เลือก
  const displayedRequests = useMemo(() => {
    if (activeTab === 'manager_to_hr') return managerToHrRequests;
    if (activeTab === 'employee_to_manager') return employeeToManagerRequests;
    return pending;
  }, [activeTab, pending, managerToHrRequests, employeeToManagerRequests]);

  const handleDecision = (id: number, status: 'approved' | 'rejected', reason?: string) => {
    setBusyId(id);
    window.setTimeout(() => {
      const ok = updateLeaveStatus(id, status, reason);
      setBusyId(null);
      if (ok) {
        showToast(
          status === 'approved' ? 'อนุมัติคำขอลาเรียบร้อยแล้ว ✅' : 'ปฏิเสธคำขอลาเรียบร้อยแล้ว',
          status === 'approved' ? 'success' : 'info'
        );
      }
    }, 400);
  };

  const handleConfirmReject = () => {
    if (rejectingId === null) return;
    handleDecision(rejectingId, 'rejected', rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
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
            {isHR ? 'ภาพรวมคำขอที่รอ HR ดำเนินการ' : `แผนก ${user.department}`} · มี{' '}
            <span className="font-semibold text-indigo-600">{pending.length} คำขอ</span> ที่รอการตรวจสอบ
          </p>
        </div>

        {/* แถบแท็บตัวกรองแยกประเภทคำขอ */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({pending.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manager_to_hr')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
              activeTab === 'manager_to_hr'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👔 หัวหน้า ➔ HR</span>
            {managerToHrRequests.length > 0 && (
              <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[10px] text-purple-700 font-bold">
                {managerToHrRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employee_to_manager')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
              activeTab === 'employee_to_manager'
                ? 'bg-white text-sky-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👤 พนักงาน ➔ หัวหน้า</span>
            {employeeToManagerRequests.length > 0 && (
              <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] text-sky-700 font-bold">
                {employeeToManagerRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* แสดงรายการคำขอ */}
      {displayedRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            ✨
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">ไม่มีคำขอค้างอนุมัติในหมวดนี้</h3>
          <p className="mt-1 text-sm text-slate-500">
            คำขอลาทั้งหมดได้รับการตรวจสอบและดำเนินการเรียบร้อยแล้ว
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((req) => {
            const requester = getRequester(req.employeeId);
            const isManagerRequest = requester?.role === 'manager';
            const isSelf = req.employeeId === user.id;
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

            // ตรวจสอบสิทธิ์ว่าผู้ใช้ปัจจุบันสามารถกด อนุมัติ/ปฏิเสธ ได้หรือไม่
            let canAct = false;
            let displayBadgeNotice: string | null = null;
            let isEscalatedOverride = false;

            if (isSelf) {
              displayBadgeNotice = 'คำขอของตนเอง (รอ HR อนุมัติ)';
            } else if (isHR) {
              if (isManagerRequest) {
                // คำขอจากหัวหน้าส่งถึง HR -> HR อนุมัติได้ตามปกติ
                canAct = true;
              } else {
                // คำขอจากพนักงานส่งถึงหัวหน้าแผนก
                if (req.isEscalated) {
                  // เกินกำหนดเวลา -> HR มีสิทธิ์อนุมัติแทน
                  canAct = true;
                  isEscalatedOverride = true;
                } else {
                  // เคสปกติ -> ซ่อนปุ่ม ไม่ให้ HR ข้ามหน้าหัวหน้า
                  canAct = false;
                  displayBadgeNotice = `รอการพิจารณาจากหัวหน้าฝ่าย (${req.department})`;
                }
              }
            } else {
              // กรณีผู้ใช้เป็น Manager ในแผนก
              if (req.department === user.department) {
                canAct = true;
              }
            }

            return (
              <div
                key={req.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md sm:p-6 ${
                  isManagerRequest ? 'border-purple-200' : 'border-slate-200'
                }`}
              >
                {/* แถบสีซ้ายสุดระบุประเภท */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    isManagerRequest
                      ? 'bg-purple-600'
                      : req.isEscalated
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                />

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    {/* ข้อมูลพนักงานและป้ายระบุสายการอนุมัติ */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs ${
                          isManagerRequest ? 'bg-purple-600' : 'bg-indigo-600'
                        }`}
                      >
                        {req.employeeName.charAt(0)}
                      </div>

                      <span className="text-base font-bold text-slate-900">
                        {req.employeeName}
                      </span>

                      {isManagerRequest ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-200">
                          👔 คำขอหัวหน้าแผนก (ส่งถึง HR)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-200">
                          👤 คำขอพนักงาน (ส่งถึงหัวหน้า)
                        </span>
                      )}

                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        แผนก {req.department}
                      </span>

                      <LeaveTypeBadge type={req.leaveType} />

                      {/* ปุ่มดูประวัติการเข้างาน */}
                      <button
                        type="button"
                        onClick={() =>
                          setInspectingEmp({
                            id: req.employeeId,
                            name: req.employeeName,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        ⏱️ ประวัติเข้างาน
                      </button>

                      {/* ป้ายเตือนกรณีเคส Escalated */}
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

                    {/* รายละเอียดช่วงวันที่และตำแหน่ง */}
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
                      <div>
                        <span className="text-slate-400">ตำแหน่ง: </span>
                        <span className="font-medium text-slate-700">
                          {requester?.position || '-'}
                        </span>
                      </div>
                    </div>

                    {/* เหตุผลการลา */}
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold text-slate-500">เหตุผล: </span>
                      <span className="text-slate-800">{req.reason || '-'}</span>
                    </div>

                    {/* ข้อความแจ้งเตือนอัตรากำลังคน */}
                    {check?.isShort && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900">
                        หากอนุมัติ แผนกจะเหลือกำลังคน{' '}
                        <strong>{check.minRemaining} คน</strong> ในวันที่{' '}
                        {check.shortDays.slice(0, 2).map((d) => formatThaiDate(d)).join(', ')}{' '}
                        (เกณฑ์ขั้นต่ำ {dept?.minRequiredStaff ?? '-'} คน)
                      </div>
                    )}
                  </div>

                  {/* ฝั่งปุ่มคำสั่ง หรือ ข้อความจำกัดสิทธิ์ */}
                  <div className="flex shrink-0 flex-col items-end justify-center gap-2 sm:min-w-[190px]">
                    {canAct ? (
                      <>
                        {isEscalatedOverride && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-300">
                            ⚡ อนุมัติแทนเนื่องจากเกินกำหนดเวลา
                          </span>
                        )}
                        <div className="flex w-full gap-2 sm:flex-col">
                          <button
                            type="button"
                            onClick={() => handleDecision(req.id, 'approved')}
                            disabled={busy}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-98 disabled:opacity-60 cursor-pointer"
                          >
                            {busy ? 'กำลังบันทึก...' : '✓ อนุมัติ'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(req.id)}
                            disabled={busy}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 hover:border-rose-200 active:scale-98 disabled:opacity-60 cursor-pointer"
                          >
                            ✕ ปฏิเสธ
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-center text-xs text-slate-500">
                        <span className="block font-semibold text-slate-700 mb-0.5">
                          [ {displayBadgeNotice || 'ไม่มีสิทธิ์อนุมัติ'} ]
                        </span>
                        <span className="text-[11px] text-slate-400">
                          สงวนสิทธิ์ให้หัวหน้าสายงานพิจารณา
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ดู Log เวลาเข้างาน */}
      {inspectingEmp && (
        <AttendanceModal
          employeeId={inspectingEmp.id}
          employeeName={inspectingEmp.name}
          isOpen={true}
          onClose={() => setInspectingEmp(null)}
        />
      )}

      {/* Modal ระบุเหตุผลการไม่อนุมัติ */}
      {rejectingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              ระบุเหตุผลการไม่อนุมัติ
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="กรอกเหตุผลเพื่อแจ้งให้พนักงานทราบ..."
              className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}