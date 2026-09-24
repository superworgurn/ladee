import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Card, StatCard } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import {
  LeaveTypeBadge,
  RoleBadge,
  StatusBadge,
} from '../components/Badge';
import { ApprovalActions } from '../components/ApprovalActions';
import { formatThaiDate, todayISO } from '../utils/date';
import { getOwnRequests, getRequestsToApprove } from '../utils/approval';

export default function HRAdminDashboard() {
  const {
    user,
    employees,
    departments,
    leaveRequests,
    auditLogs,
    updateLeaveStatus,
  } = useApp();
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  if (!user) return null;

  const today = todayISO();
  const toApprove = getRequestsToApprove(leaveRequests, user);
  const ownPending = getOwnRequests(leaveRequests, user).filter(
    (r) => r.status === 'pending'
  );

  const allPending = leaveRequests.filter((r) => r.status === 'pending');
  const todayApproved = leaveRequests.filter(
    (r) => r.status === 'approved' && r.startDate <= today && r.endDate >= today
  );

  const totalStaff = employees.filter((e) => e.role !== 'top_management').length;

  const handleDecision = (id: number, status: 'approved' | 'rejected', reason?: string) => {
    setBusyId(id);
    window.setTimeout(() => {
      const ok = updateLeaveStatus(id, status, reason);
      setBusyId(null);
      if (ok) {
        showToast(
          status === 'approved' ? 'อนุมัติเรียบร้อย ✅' : 'ปฏิเสธเรียบร้อย',
          status === 'approved' ? 'success' : 'info'
        );
      } else {
        showToast('ไม่มีสิทธิ์อนุมัติคำขอนี้', 'error');
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="แดชบอร์ด HR Admin"
        subtitle={`${user.name} (${user.position}) · ภาพรวมทุกแผนก · ${formatThaiDate(today)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/working-today"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              👥 ใครทำงานวันนี้
            </Link>
            <Link
              to="/hr/approvals"
              className="relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <span>อนุมัติคำขอลา</span>
              {toApprove.length > 0 ? (
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                  {toApprove.length}
                </span>
              ) : null}
            </Link>
          </div>
        }
      />

      {/* ---------- สถิติรวม ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="พนักงานทั้งหมด"
          value={totalStaff}
          tone="default"
          icon="👥"
          hint={`${departments.length} แผนก`}
        />
        <StatCard
          label="ลาวันนี้ (approved)"
          value={todayApproved.length}
          tone="warning"
          icon="🌴"
          hint="ทั้งบริษัท"
        />
        <StatCard
          label="รออนุมัติทั้งหมด"
          value={allPending.length}
          tone={allPending.length > 0 ? 'warning' : 'default'}
          icon="⏳"
        />
        <StatCard
          label="รอฉันอนุมัติ"
          value={toApprove.length}
          tone={toApprove.length > 0 ? 'danger' : 'success'}
          icon="📥"
          hint="จากหัวหน้าแผนกต่าง ๆ"
        />
      </div>

      {/* ---------- สรุปกำลังคนทุกแผนก ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          สถานะกำลังคนทุกแผนก (วันนี้)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => {
            const onLeave = leaveRequests.filter(
              (r) =>
                r.department === dept.name &&
                r.status === 'approved' &&
                r.startDate <= today &&
                r.endDate >= today
            ).length;
            const remaining = dept.totalEmployees - onLeave;
            const isShort = remaining < dept.minRequiredStaff;
            return (
              <Card
                key={dept.name}
                className={
                  isShort
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-emerald-200 bg-emerald-50'
                }
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {dept.name}
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    isShort ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {remaining} / {dept.totalEmployees}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  ลา {onLeave} คน · ขั้นต่ำ {dept.minRequiredStaff} คน
                </p>
                {isShort ? (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    ⚠️ ต่ำกว่าเกณฑ์
                  </p>
                ) : (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    ✓ ปกติ
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------- คำขอที่ต้องอนุมัติ (ของ manager) ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          คำขอที่ต้องอนุมัติ (หัวหน้าแผนกขอลา)
        </h2>

        {toApprove.length === 0 ? (
          <Card>
            <p className="py-4 text-center text-sm text-slate-500">
              ไม่มีคำขอที่รออนุมัติในขณะนี้ 🎉
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {toApprove.map((req) => {
              const busy = busyId === req.id;
              return (
                <Card key={req.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {req.employeeName}
                        </p>
                        <LeaveTypeBadge type={req.leaveType} />
                        <span className="text-xs text-slate-500">
                          · {req.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatThaiDate(req.startDate)} –{' '}
                        {formatThaiDate(req.endDate)}
                      </p>
                      <p className="text-xs text-slate-600">{req.reason}</p>
                    </div>
                    <div className="sm:min-w-[130px]">
                      <ApprovalActions
                        request={req}
                        onDecision={handleDecision}
                        busy={busy}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- คำขอของตัวเอง (read-only) ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          คำขอของฉัน (รอผู้บริหารอนุมัติ · อ่านเท่านั้น)
        </h2>

        {ownPending.length === 0 ? (
          <Card>
            <p className="py-4 text-center text-sm text-slate-500">
              ไม่มีคำขอของตัวเองที่ค้างอยู่
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {ownPending.map((req) => (
              <Card key={req.id} className="border-indigo-100 bg-indigo-50/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <LeaveTypeBadge type={req.leaveType} />
                      <span className="text-sm text-slate-600">
                        {formatThaiDate(req.startDate)} –{' '}
                        {formatThaiDate(req.endDate)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{req.reason}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-3">
                  <ApprovalActions request={req} onDecision={handleDecision} isSelfRequest={true} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Audit Log ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          ประวัติการอนุมัติ (Audit Log)
        </h2>

        <Card className="p-0">
          {auditLogs.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              ยังไม่มีประวัติการอนุมัติ
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">เวลา</th>
                    <th className="px-4 py-3 font-semibold">การกระทำ</th>
                    <th className="px-4 py-3 font-semibold">โดย</th>
                    <th className="px-4 py-3 font-semibold">คำขอของ</th>
                    <th className="px-4 py-3 font-semibold">Ref ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => {
                    const actor = employees.find(
                      (e) => e.id === log.performedBy
                    );
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {log.action === 'approve' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                              ✓ อนุมัติ
                            </span>
                          ) : log.action === 'reject' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 ring-1 ring-inset ring-rose-200">
                              ✕ ปฏิเสธ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 ring-1 ring-inset ring-sky-200">
                              ✎ แก้ไขวันลา
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">
                              {log.performedByName}
                            </span>
                            {actor ? <RoleBadge role={actor.role} /> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {log.targetEmployeeName}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          #{log.targetLeaveRequestId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}