import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/date';

interface AttendanceModalProps {
  employeeId: number;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({
  employeeId,
  employeeName,
  isOpen,
  onClose,
}: AttendanceModalProps) {
  const { attendance } = useApp();

  // กรองเฉพาะประวัติการลงเวลาของพนักงานคนนี้ เรียงจากวันล่าสุด
  const logs = useMemo(() => {
    return attendance
      .filter((a) => a.employeeId === employeeId)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [attendance, employeeId]);

  if (!isOpen) return null;

  const formatClock = (isoString: string | null) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return isNaN(d.getTime())
      ? '-'
      : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  // คำนวณชั่วโมงทำงาน
  const getDuration = (inIso: string, outIso: string | null) => {
    if (!outIso) return 'กำลังปฏิบัติงาน';
    const start = new Date(inIso).getTime();
    const end = new Date(outIso).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return `${diffHours.toFixed(1)} ชม.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ประวัติการลงเวลาปฏิบัติงาน (Log รายบุคคล)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              พนักงาน: <span className="font-semibold text-slate-800">{employeeName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* ข้อมูล Log */}
        <div className="mt-4 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              ยังไม่มีบันทึกเวลาเข้า-ออกงานของพนักงานท่านนี้
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">วันที่</th>
                  <th className="px-3 py-2.5">เวลาเข้างาน</th>
                  <th className="px-3 py-2.5">เวลาออกงาน</th>
                  <th className="px-3 py-2.5">ระยะเวลา</th>
                  <th className="px-3 py-2.5 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((record) => (
                  <tr key={record.date} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {formatThaiDate(record.date)}
                    </td>
                    <td className="px-3 py-2.5 text-emerald-600 font-semibold">
                      {formatClock(record.checkIn)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {formatClock(record.checkOut)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {getDuration(record.checkIn, record.checkOut)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {record.checkOut ? (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          ออกงานแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          กำลังทำงาน
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}