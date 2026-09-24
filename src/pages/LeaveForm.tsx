import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import type { LeaveType } from '../types';
import {
  diffInDaysInclusive,
  formatThaiDate,
  todayISO,
} from '../utils/date';
import { checkStaffingForRange } from '../utils/staffing';

const LEAVE_TYPES: LeaveType[] = ['ป่วย', 'กิจ', 'พักร้อน', 'คลอด'];

export default function LeaveForm() {
  const { user, departments, leaveRequests, addLeaveRequest } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState<LeaveType>('พักร้อน');
  const [startDate, setStartDate] = useState<string>(todayISO());
  const [endDate, setEndDate] = useState<string>(todayISO());
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  /** คำนวณจำนวนวันทำงานที่ขอ (ตัดเสาร์-อาทิตย์) */
  const requestedDays = useMemo(
    () => diffInDaysInclusive(startDate, endDate),
    [startDate, endDate]
  );

  /**
   * คำนวณวันลาที่ "รออนุมัติ" ของผู้ใช้คนนี้
   * เพื่อป้องกันไม่ให้ส่งคำขอซ้อนทับจนยอดเกิน
   */
  const pendingDays = useMemo(() => {
    if (!user) return 0;
    return leaveRequests
      .filter(
        (req) =>
          req.employeeId === user.id &&
          req.status === 'pending'
      )
      .reduce((total, req) => {
        return total + diffInDaysInclusive(req.startDate, req.endDate);
      }, 0);
  }, [user, leaveRequests]);

  /** คำนวณยอดคงเหลือที่ใช้ได้จริง = ยอดรวม - ยอดที่รออนุมัติ */
  const availableBalance = user ? user.leaveBalance - pendingDays : 0;

  /** ตรวจว่ายอดไม่พอหรือไม่ */
  const balanceNotEnough = requestedDays > availableBalance;

  /** ตรวจว่าผู้ใช้เป็น HR Admin หรือไม่ (สำหรับลาแบบหลอกๆ) */
  const isHRAdmin = user?.role === 'hr_admin';

  /** ตรวจกำลังคนแบบ live */
  const staffingWarning = useMemo(() => {
    if (!user) return null;
    if (!startDate || !endDate || endDate < startDate) return null;

    const dept = departments.find((d) => d.name === user.department);
    if (!dept) return null;

    return checkStaffingForRange(
      dept,
      user.id,
      startDate,
      endDate,
      leaveRequests
    );
  }, [user, departments, leaveRequests, startDate, endDate]);

  if (!user) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: string[] = [];

    if (!startDate || !endDate) {
      nextErrors.push('กรุณาระบุวันที่เริ่มต้นและสิ้นสุด');
    }
    if (startDate && endDate && endDate < startDate) {
      nextErrors.push('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น');
    }
    if (reason.trim().length < 3) {
      nextErrors.push('กรุณาระบุเหตุผลการลา (อย่างน้อย 3 ตัวอักษร)');
    }

    /**
     * เช็คกับ availableBalance แทน leaveBalance
     * สำหรับ HR Admin (ลาแบบหลอกๆ) ไม่ต้องเช็คยอด
     */
    if (!isHRAdmin && requestedDays > availableBalance) {
      nextErrors.push(
        `วันลาคงเหลือไม่พอ (ต้องการ ${requestedDays} วัน แต่เหลือใช้ได้จริง ${availableBalance} วัน)`
      );
    }

    /** สำหรับพนักงานทั่วไป: ถ้าขอ 0 วัน (เช่น ลาเฉพาะเสาร์-อาทิตย์) */
    if (!isHRAdmin && requestedDays === 0) {
      nextErrors.push('ช่วงวันที่เลือกไม่มีวันทำงาน (ตรงกับเสาร์-อาทิตย์ทั้งหมด)');
    }

    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    setSubmitting(true);
    window.setTimeout(() => {
      addLeaveRequest({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        /**
         * HR Admin ลาแบบหลอกๆ:
         * ไม่ต้องมี approver (approverId = null)
         * ระบบจะ auto-approve หรือแสดงเป็นข้อมูลสาธิต
         */
        approverId: isHRAdmin ? null : user.approverId,
      });

      setSubmitting(false);

      if (isHRAdmin) {
        showToast(
          'ส่งคำขอลาสำเร็จ (โหมดสาธิตสำหรับ HR — ไม่ต้องรออนุมัติ)',
          'info'
        );
      } else {
        showToast(
          'ส่งคำขอลาสำเร็จ รอการอนุมัติจากหัวหน้า',
          'success'
        );
      }

      navigate('/leave/history');
    }, 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ขอลาหยุดงาน"
        subtitle={
          isHRAdmin
            ? `${user.name} · ${user.department} · โหมดสาธิต (HR Admin)`
            : `${user.name} · ${user.department} · วันลาคงเหลือ ${availableBalance} วัน`
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ฟอร์ม */}
        <Card className="lg:col-span-2 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* แจ้งเตือนสำหรับ HR Admin */}
            {isHRAdmin && (
              <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 font-bold text-sky-800">
                  ℹ
                </div>
                <div>
                  <p className="text-sm font-bold text-sky-950">
                    โหมดสาธิตสำหรับ HR Admin
                  </p>
                  <p className="mt-0.5 text-sky-800 leading-relaxed">
                    คำขอลาของ HR Admin จะถูกบันทึกเป็นข้อมูลสาธิต
                    ไม่ต้องรออนุมัติจากผู้บริหาร
                    (บทบาทหลักของ HR คือการอนุมัติ/ปฏิเสธคำขอของพนักงาน)
                  </p>
                </div>
              </div>
            )}

            {/* ประเภทการลา */}
            <div>
              <label
                htmlFor="leaveType"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                ประเภทการลา
              </label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    ลา{type}
                  </option>
                ))}
              </select>
            </div>

            {/* วันที่ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  วันที่เริ่มลา
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  วันที่สิ้นสุด
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* จำนวนวัน */}
            <div
              className={[
                'flex items-center justify-between rounded-xl px-4 py-3.5 text-sm transition-colors ring-1 ring-inset',
                !isHRAdmin && balanceNotEnough
                  ? 'bg-rose-50/80 text-rose-800 ring-rose-200'
                  : 'bg-indigo-50/60 text-indigo-900 ring-indigo-200/70',
              ].join(' ')}
            >
              <span className="flex items-center gap-2 font-medium">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                รวมจำนวนวันทำงาน
              </span>
              <span className="font-bold text-base">
                {requestedDays > 0 ? requestedDays : 0} วัน
                {!isHRAdmin && balanceNotEnough && (
                  <span className="ml-2 text-xs font-semibold text-rose-600">
                    (เกินวันลาคงเหลือ!)
                  </span>
                )}
              </span>
            </div>

            {/* แสดงสรุปยอดวันลาสำหรับพนักงานทั่วไป */}
            {!isHRAdmin && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  สรุปวันลาคงเหลือ
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ยอดรวมทั้งหมด</span>
                    <span className="font-semibold text-slate-800">{user.leaveBalance} วัน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">รออนุมัติ (หักออก)</span>
                    <span className="font-semibold text-amber-600">- {pendingDays} วัน</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
                    <span className="font-semibold text-slate-700">คงเหลือใช้ได้จริง</span>
                    <span className="font-bold text-indigo-600">{availableBalance} วัน</span>
                  </div>
                </div>
              </div>
            )}

            {/* เหตุผล */}
            <div>
              <label
                htmlFor="reason"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                เหตุผลการลา
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                placeholder="ระบุเหตุผลการลาอย่างชัดเจน..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
              />
            </div>

            {/* Error list */}
            {errors.length > 0 ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800">
                <p className="font-bold text-sm text-rose-900">กรุณาแก้ไขข้อผิดพลาดดังนี้:</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Warning กำลังคน */}
            {staffingWarning?.isShort ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-800">
                  !
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-950">
                    คำขอนี้อาจส่งผลให้แผนก {user.department} มีคนไม่พอ
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    ในบางวันจะเหลือกำลังคนเพียง <strong>{staffingWarning.minRemaining} คน</strong>{' '}
                    (เกณฑ์ขั้นต่ำของแผนก: {staffingWarning.shortDays.length} วันที่อาจกระทบ)
                  </p>
                  <p className="text-slate-500">
                    ตัวอย่างวันที่กระทบ:{' '}
                    {staffingWarning.shortDays
                      .slice(0, 3)
                      .map((d) => formatThaiDate(d))
                      .join(', ')}
                    {staffingWarning.shortDays.length > 3 ? ' และวันอื่นๆ' : ''}
                  </p>
                </div>
              </div>
            ) : null}

            {/* ปุ่ม */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-150 hover:bg-indigo-700 active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    กำลังส่งคำขอ...
                  </>
                ) : (
                  'ส่งคำขอลา'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:bg-slate-50 active:scale-98 disabled:opacity-60 sm:flex-none"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </Card>

        {/* ข้อมูลประกอบ */}
        <div className="space-y-4">
          <Card className="bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              สรุปคำขอลา
            </h3>
            <dl className="mt-3 divide-y divide-slate-200/60 text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500">ประเภท</dt>
                <dd className="font-semibold text-slate-800">ลา{leaveType}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500">เริ่มวันที่</dt>
                <dd className="font-semibold text-slate-800">
                  {formatThaiDate(startDate)}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500">สิ้นสุดวันที่</dt>
                <dd className="font-semibold text-slate-800">
                  {formatThaiDate(endDate)}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="font-semibold text-slate-600">รวมวันทำงาน</dt>
                <dd className="font-bold text-indigo-600">
                  {requestedDays > 0 ? requestedDays : 0} วัน
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="border-indigo-100 bg-indigo-50/30">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ข้อควรรู้
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500">•</span>
                <span>นับเฉพาะวันทำงาน (จันทร์-ศุกร์) ไม่รวมเสาร์-อาทิตย์</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500">•</span>
                <span>คำขอใหม่จะมีสถานะเป็น <strong>"รออนุมัติ"</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500">•</span>
                <span>วันลาจะถูกตัดจากโควตาเมื่อหัวหน้าแผนก <strong>อนุมัติแล้วเท่านั้น</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500">•</span>
                <span>ระบบจะประเมินกำลังคนขั้นต่ำเพื่อป้องกันการขาดแคลนพนักงาน</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}