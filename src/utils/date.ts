/** แปลง Date → 'yyyy-mm-dd' ตาม timezone ท้องถิ่น */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** วันนี้ในรูปแบบ 'yyyy-mm-dd' */
export function todayISO(): string {
  return toISODate(new Date());
}

/** แปลง 'yyyy-mm-dd' → Date (เวลา 00:00 local) */
export function parseISODate(iso: string): Date {
  const parts = iso.split('-');
  const y = Number(parts[0] ?? 1970);
  const m = Number(parts[1] ?? 1);
  const d = Number(parts[2] ?? 1);
  return new Date(y, m - 1, d);
}

/** บวก/ลบจำนวนวันจาก ISO date */
export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** ตรวจว่าเป็นวันเสาร์หรืออาทิตย์หรือไม่ */
export function isWeekend(iso: string): boolean {
  const day = parseISODate(iso).getDay();
  return day === 0 || day === 6; // 0 = อาทิตย์, 6 = เสาร์
}

/**
 * ✅ แก้ไข: นับจำนวนวันทำงาน (จันทร์-ศุกร์) แบบรวมหัว-ท้าย
 * ตัดเสาร์-อาทิตย์ออกอัตโนมัติ
 */
export function diffInDaysInclusive(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;

  const start = parseISODate(startISO);
  const end = parseISODate(endISO);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const day = cursor.getDay();
    // นับเฉพาะจันทร์(1) - ศุกร์(5)
    if (day !== 0 && day !== 6) {
      count++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

/**
 * ✅ เพิ่มใหม่: นับวันลาทั้งหมด (รวมเสาร์-อาทิตย์)
 * ใช้สำหรับ check staffing ที่ต้องดูทุกวัน
 */
export function diffInCalendarDaysInclusive(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = parseISODate(startISO).getTime();
  const end = parseISODate(endISO).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  if (end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

/** คืน array ของทุกวันในช่วง [start, end] (รวมเสาร์-อาทิตย์ สำหรับ staffing) */
export function eachDayInRange(startISO: string, endISO: string): string[] {
  const days: string[] = [];
  if (!startISO || !endISO || endISO < startISO) return days;

  let cursor = startISO;
  let guard = 0;
  while (cursor <= endISO && guard < 400) {
    days.push(cursor);
    cursor = addDaysISO(cursor, 1);
    guard += 1;
  }
  return days;
}

/** ✅ เพิ่มใหม่: คืน array เฉพาะวันทำงานในช่วง [start, end] */
export function eachBusinessDayInRange(startISO: string, endISO: string): string[] {
  return eachDayInRange(startISO, endISO).filter((d) => !isWeekend(d));
}

/** ตรวจว่าสองช่วงวันที่ทับซ้อนกันหรือไม่ */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

/** แสดงวันที่แบบไทย เช่น 12 ก.พ. 2568 */
export function formatThaiDate(iso: string): string {
  if (!iso) return '-';
  try {
    return parseISODate(iso).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** แสดงเวลาจาก ISO datetime เช่น 09:30 */
export function formatTime(dateTimeISO: string | null | undefined): string {
  if (!dateTimeISO) return '--:--';
  try {
    return new Date(dateTimeISO).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}