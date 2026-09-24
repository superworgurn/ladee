import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, StatCard } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { formatThaiDate } from '../utils/date';

export default function AttendanceHistory() {
  const { user, employees, attendance } = useApp();

  if (!user) return null;

  const isHR = user.role === 'hr_admin' || user.role === 'top_management';
  const isManager = user.role === 'manager';

  // รายชื่อพนักงานที่สามารถเลือกดูได้
  const selectableEmployees = useMemo(() => {
    if (isHR) return employees;
    if (isManager) return employees.filter((e) => e.department === user.department);
    return [user];
  }, [employees, isHR, isManager, user]);

  // ID พนักงานที่กำลังเลือกดู Log
  const [selectedEmpId, setSelectedEmpId] = useState<number>(user.id);

  // ข้อมูลพนักงานเป้าหมาย
  const targetEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || user;
  }, [employees, selectedEmpId, user]);

  // ดึง Log ของพนักงานที่เลือก
  const employeeLogs = useMemo(() => {
    return attendance
      .filter((a) => a.employeeId === selectedEmpId)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [attendance, selectedEmpId]);

  const formatClock = (isoString: string | null) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return isNaN(d.getTime())
      ? '-'
      : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const completedCheckouts = employeeLogs.filter((l) => l.checkOut !== null).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติการลงเวลาเข้า-ออกงาน"
        subtitle={
          isHR
            ? 'ตรวจสอบบันทึกเวลาปฏิบัติงานของพนักงานทุกแผนก'
            : isManager
            ? `ตรวจสอบบันทึกเวลาของพนักงานในแผนก ${user.department}`
            : `ประวัติการลงเวลาปฏิบัติงานของ ${user.name}`
        }
      />

      {/* ตัวเลือกพนักงาน (เฉพาะหัวหน้าแผนก หรือ HR) */}
      {(isManager || isHR) && (
        <Card className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                เลือกพนักงานที่ต้องการตรวจสอบ Log
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-2xs outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {selectableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position} · {emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right text-xs text-slate-500">
              สังกัด: <span className="font-semibold text-slate-800">{targetEmployee.department}</span> ·{' '}
              ตำแหน่ง: <span className="font-semibold text-slate-800">{targetEmployee.position}</span>
            </div>
          </div>
        </Card>
      )}

      {/* สถิติการลงเวลา */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="จำนวนวันที่บันทึกเวลา"
          value={employeeLogs.length}
          tone="default"
          icon="📅"
          hint="วันทำการทั้งหมดที่บันทึก"
        />
        <StatCard
          label="ลงเวลาครบ (เข้า-ออก)"
          value={completedCheckouts}
          tone="success"
          icon="✅"
          hint="เช็คอินและเช็คเอาท์เรียบร้อย"
        />
        <StatCard
          label="ยังไม่เช็คเอาท์"
          value={employeeLogs.length - completedCheckouts}
          tone={employeeLogs.length - completedCheckouts > 0 ? 'warning' : 'default'}
          icon="⏳"
          hint="อยู่ระหว่างปฏิบัติงานหรือลืมลงเวลา"
        />
      </div>

      {/* ตารางบันทึกเวลา */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Log บันทึกเวลาปฏิบัติงาน: {targetEmployee.name}
          </h3>
        </div>

        {employeeLogs.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            ไม่พบบันทึกการลงเวลาปฏิบัติงาน
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/40 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">วันที่</th>
                  <th className="px-5 py-3">เวลาเข้างาน (Check-in)</th>
                  <th className="px-5 py-3">เวลาออกงาน (Check-out)</th>
                  <th className="px-5 py-3 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeLogs.map((log) => (
                  <tr key={log.date} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {formatThaiDate(log.date)}
                    </td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">
                      {formatClock(log.checkIn)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatClock(log.checkOut)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.checkOut ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          เสร็จสิ้น
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          กำลังปฏิบัติงาน
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}