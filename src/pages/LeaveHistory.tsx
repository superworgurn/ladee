import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { LeaveTypeBadge, StatusBadge } from '../components/Badge';
import { diffInDaysInclusive, formatThaiDate } from '../utils/date';

export default function LeaveHistory() {
  const { user, leaveRequests } = useApp();

  if (!user) return null;

  const myRequests = leaveRequests
    .filter((r) => r.employeeId === user.id)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  const totalApprovedDays = myRequests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + diffInDaysInclusive(r.startDate, r.endDate), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติการลา"
        subtitle={`${user.name} · ${user.department} · ใช้วันลาสะสม ${totalApprovedDays} วัน`}
        action={
          <Link
            to="/leave/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-150 hover:bg-indigo-700 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            ขอลาใหม่
          </Link>
        }
      />

      <Card className="overflow-hidden p-0">
        {myRequests.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📭
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">
              ยังไม่มีประวัติการลา
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              เริ่มต้นโดยการส่งคำขอลาฉบับแรกของคุณผ่านปุ่มขอลาใหม่
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5 font-semibold">ประเภท</th>
                    <th className="px-6 py-3.5 font-semibold">ช่วงวันที่</th>
                    <th className="px-6 py-3.5 font-semibold">จำนวน</th>
                    <th className="px-6 py-3.5 font-semibold">เหตุผล</th>
                    <th className="px-6 py-3.5 font-semibold">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRequests.map((req) => {
                    const days = diffInDaysInclusive(req.startDate, req.endDate);
                    return (
                      <tr key={req.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <LeaveTypeBadge type={req.leaveType} />
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {days} วัน
                        </td>
                        <td className="max-w-xs px-6 py-4">
                          <p className="truncate text-slate-600 text-xs sm:text-sm" title={req.reason}>
                            {req.reason}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {myRequests.map((req) => {
                const days = diffInDaysInclusive(req.startDate, req.endDate);
                return (
                  <li key={req.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <LeaveTypeBadge type={req.leaveType} />
                      <StatusBadge status={req.status} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {formatThaiDate(req.startDate)} – {formatThaiDate(req.endDate)}
                      </p>
                      <p className="mt-0.5 text-xs text-indigo-600 font-medium">
                        ระยะเวลา {days} วัน
                      </p>
                    </div>
                    {req.reason && (
                      <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                        {req.reason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}