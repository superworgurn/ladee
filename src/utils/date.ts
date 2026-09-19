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

/** นับจำนวนวันแบบรวมหัว-ท้าย */
export function diffInDaysInclusive(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = parseISODate(startISO).getTime();
  const end = parseISODate(endISO).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  if (end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

/** คืน array ของทุกวันในช่วง [start, end] */
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

/** ตรวจว่าสองช่วงวันที่ทับซ้อนกันหรือไม่ (เทียบ string ISO ได้เลย) */
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