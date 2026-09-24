import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LeaveTypeBadge, StatusBadge } from '../components/Badge';
import { formatThaiDate, diffInDaysInclusive } from '../utils/date';
import type { LeaveRequest } from '../types';

export default function LeaveHistory() {
  const { user, leaveRequests } = useApp();
  const [activeModalRequest, setActiveModalRequest] = useState<LeaveRequest | null>(null);

  if (!user) return null;

  // กรองเฉพาะคำขอของตนเอง เรียงลำดับจากวันที่เริ่มลาล่าสุด
  const myRequests = useMemo(() => {
    return leaveRequests
      .filter((r) => r.employeeId === user.id)
      .sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
  }, [leaveRequests, user]);

  // คำนวณวันลาที่ได้รับอนุมัติสะสม
  const usedDays = useMemo(() => {
    return myRequests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + diffInDaysInclusive(r.startDate, r.endDate), 0);
  }, [myRequests]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header ส่วนหัว */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ประวัติการลา
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.name} · {user.department} · ใช้วันลาสะสม{' '}
            <span className="font-semibold text-slate-700">{usedDays} วัน</span>
          </p>
        </div>
        <Link
          to="/leave"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
        >
          <span>+</span> ขอลาใหม่
        </Link>
      </div>

      {/* ตารางรายการประวัติการลา */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {myRequests.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">ยังไม่มีประวัติการยื่นคำขอลา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">ประเภท</th>
                  <th className="px-5 py-3.5">ช่วงวันที่</th>
                  <th className="px-5 py-3.5">จำนวน</th>
                  <th className="px-5 py-3.5">เหตุผล</th>
                  <th className="px-5 py-3.5">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req) => {
                  const days = diffInDaysInclusive(req.startDate, req.endDate);
                  const isRejected = req.status === 'rejected';

                  return (
                    <tr
                      key={req.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* ประเภทการลา */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <LeaveTypeBadge type={req.leaveType} />
                      </td>

                      {/* ช่วงวันที่ */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                        {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                      </td>

                      {/* จำนวนวันทำงาน */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-800">
                        {days} วัน
                      </td>

                      {/* เหตุผลการลา + เหตุผลการไม่อนุมัติ */}
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{req.reason || '-'}</p>
                        
                        {/* แสดงเหตุผลการปฏิเสธอย่างชัดเจนเมื่อถูก Rejected */}
                        {isRejected && (
                          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/80 p-2 text-xs text-rose-800">
                            <span className="font-bold text-rose-900">
                              เหตุผลที่ไม่อนุมัติ:
                            </span>{' '}
                            {req.rejectReason || 'ไม่ได้ระบุเหตุผลเพิ่มเติม'}
                          </div>
                        )}
                      </td>

                      {/* สถานะ */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={req.status} />
                          {isRejected && req.rejectReason && (
                            <button
                              type="button"
                              onClick={() => setActiveModalRequest(req)}
                              className="text-[11px] font-medium text-rose-600 underline hover:text-rose-700 cursor-pointer"
                            >
                              ดูรายละเอียด
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ป๊อปอัปดูเหตุผลการไม่อนุมัติ */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold">
                ✕
              </span>
              <h3 className="text-base font-bold text-slate-900">
                รายละเอียดการไม่อนุมัติ
              </h3>
            </div>

            <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">ประเภท:</span>
                <span className="font-semibold text-slate-800">
                  ลา{activeModalRequest.leaveType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ช่วงวันที่:</span>
                <span className="font-semibold text-slate-800">
                  {formatThaiDate(activeModalRequest.startDate)} –{' '}
                  {formatThaiDate(activeModalRequest.endDate)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-400">เหตุผลที่พนักงานขอลา:</span>
                <p className="mt-1 font-medium text-slate-800">
                  {activeModalRequest.reason || '-'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs">
              <p className="font-bold text-rose-900">เหตุผลจากผู้อนุมัติ:</p>
              <p className="mt-1 leading-relaxed text-rose-700">
                {activeModalRequest.rejectReason || 'ไม่มีการระบุข้อความเหตุผล'}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalRequest(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}