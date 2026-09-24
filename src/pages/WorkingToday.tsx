import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveTypeBadge, RoleBadge, WorkingStatusBadge } from '../components/Badge';
import { formatThaiDate, formatTime, todayISO } from '../utils/date';
import { getWorkingStatusForDate } from '../utils/staffing';

export default function WorkingToday() {
  const { user, employees, departments, leaveRequests, attendance } = useApp();

  if (!user) return null;

  // ตรวจสอบสิทธิ์ว่าเป็น HR / ผู้บริหารระดับสูงหรือไม่
  const isHR = user.role === 'hr_admin' || user.role === 'top_management';

  const [date, setDate] = useState<string>(todayISO());
  const [deptFilter, setDeptFilter] = useState<string>(isHR ? 'all' : user.department);
  const [search, setSearch] = useState('');

  // คำนวณสถานะการทำงานของพนักงานทั้งหมดในวันที่เลือก
  const allStatus = useMemo(
    () => getWorkingStatusForDate(employees, leaveRequests, date),
    [employees, leaveRequests, date]
  );

  // กรองข้อมูล: ถ้าไม่ใช่ HR จะถูกบังคับให้เห็นเฉพาะแผนกตัวเองเสมอ
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStatus.filter((s) => {
      // 🔒 สิทธิ์ระดับหัวหน้าแผนก/พนักงานทั่วไป: บังคับกรองเฉพาะแผนกตนเอง
      if (!isHR && s.employee.department !== user.department) {
        return false;
      }

      // 🔓 สิทธิ์ระดับ HR: กรองตามตัวเลือก Dropdown
      if (isHR && deptFilter !== 'all' && s.employee.department !== deptFilter) {
        return false;
      }

      if (q && !s.employee.name.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });
  }, [allStatus, isHR, user.department, deptFilter, search]);

  const onLeave = filtered.filter((s) => s.status === 'on_leave');
  const working = filtered.filter((s) => s.status === 'working');
  const total = filtered.length;

  const groupedByDept = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const list = map.get(s.employee.department) ?? [];
      list.push(s);
      map.set(s.employee.department, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, 'th')
    );
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ใครลาวันนี้ / ใครทำงานอยู่
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          ตรวจสอบสถานะการทำงานประจำวัน ·{' '}
          {isHR ? 'ภาพรวมทุกแผนก' : `เฉพาะแผนก ${user.department}`} ·{' '}
          {formatThaiDate(date)}
        </p>
      </div>

      {/* แถบตัวกรอง */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3">
        {/* ตัวเลือกวันที่ */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            เลือกวันที่
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* ตัวเลือกแผนก */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            แผนก
          </label>
          {isHR ? (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">ทุกแผนก (ภาพรวม)</option>
              {departments.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={`แผนก ${user.department} (สิทธิ์เฉพาะแผนก)`}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          )}
        </div>

        {/* ค้นหาชื่อ */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            ค้นหาชื่อพนักงาน
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="พิมพ์ชื่อพนักงาน..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* สรุปตัวเลข */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {isHR ? 'พนักงานตามเงื่อนไข' : `พนักงานแผนก ${user.department}`}
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total} คน</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">ปฏิบัติงานวันนี้</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {working.length}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({total > 0 ? Math.round((working.length / total) * 100) : 0}%)
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-600">ลางานวันนี้</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {onLeave.length}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({total > 0 ? Math.round((onLeave.length / total) * 100) : 0}%)
            </span>
          </p>
        </div>
      </div>

      {/* รายการพนักงานที่ลาวันนี้ */}
      {onLeave.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <span>🌴</span>
            <span className="text-sm">
              พนักงานที่ลาวันนี้ ({onLeave.length} คน)
              {!isHR && ` · แผนก ${user.department}`}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {onLeave.map((s) => (
              <div
                key={s.employee.id}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs"
              >
                <span className="font-semibold">{s.employee.name}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{s.employee.department}</span>
                {s.leaveRequest && <LeaveTypeBadge type={s.leaveRequest.leaveType} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* รายชื่อแยกตามแผนก */}
      {groupedByDept.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
          ไม่พบข้อมูลตามเงื่อนไขที่เลือก
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDept.map(([deptName, list]) => {
            const dept = departments.find((d) => d.name === deptName);
            const onLeaveCount = list.filter((s) => s.status === 'on_leave').length;
            const workingCount = list.length - onLeaveCount;
            const isShort = dept ? workingCount < dept.minRequiredStaff : false;

            return (
              <div
                key={deptName}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900">{deptName}</span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-2xs">
                      ทำงาน {workingCount}/{list.length} คน
                    </span>
                    {isShort && (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
                        ⚠️ ต่ำกว่าเกณฑ์
                      </span>
                    )}
                  </div>
                  {dept && (
                    <span className="text-xs text-slate-400">
                      เกณฑ์ขั้นต่ำ {dept.minRequiredStaff} คน
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 px-5">
                  {list.map((s) => {
                    const emp = s.employee;
                    const att = attendance.find(
                      (a) => a.employeeId === emp.id && a.date === date
                    );

                    return (
                      <div
                        key={emp.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {emp.name}
                            </span>
                            <RoleBadge role={emp.role} />
                            <span className="text-xs text-slate-400">
                              {emp.position}
                            </span>
                          </div>

                          {s.status === 'on_leave' && s.leaveRequest ? (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <LeaveTypeBadge type={s.leaveRequest.leaveType} />
                              <span>
                                {formatThaiDate(s.leaveRequest.startDate)} –{' '}
                                {formatThaiDate(s.leaveRequest.endDate)}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="italic text-slate-500">
                                "{s.leaveRequest.reason}"
                              </span>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">
                              {att?.checkIn
                                ? `เช็คอิน ${formatTime(att.checkIn)}${
                                    att.checkOut
                                      ? ` · เช็คเอาท์ ${formatTime(att.checkOut)}`
                                      : ''
                                  }`
                                : 'ยังไม่ได้ลงเวลา'}
                            </p>
                          )}
                        </div>

                        <WorkingStatusBadge status={s.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}