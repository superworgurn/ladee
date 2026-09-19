import type { LeaveRequest } from '../types';

const BASE = new Date();

function isoOffset(offsetDays: number): string {
  const d = new Date(BASE.getFullYear(), BASE.getMonth(), BASE.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function createdOffset(offsetDays: number, hour = 9, minute = 30): string {
  const d = new Date(
    BASE.getFullYear(),
    BASE.getMonth(),
    BASE.getDate() + offsetDays,
    hour,
    minute,
    0
  );
  return d.toISOString();
}

/** ประเภทข้อมูล: approverId ถูก set ตอนสร้างคำขอ (ตาม employees.approverId) */
export const LEAVE_REQUESTS: LeaveRequest[] = [
  /* ---------- วันนี้ มีคนลาหลายคน (สำหรับ demo ฟีเจอร์ "ใครทำงานวันนี้") ---------- */
  {
    id: 1001,
    employeeId: 3,
    employeeName: 'วีระ ตั้งใจ',
    department: 'ฝ่ายขาย',
    leaveType: 'ป่วย',
    startDate: isoOffset(0),
    endDate: isoOffset(0),
    reason: 'มีไข้สูง ต้องไปพบแพทย์',
    status: 'approved',
    createdAt: createdOffset(-1, 8, 5),
    approverId: 1,
  },
  {
    id: 1002,
    employeeId: 6,
    employeeName: 'อารีย์ ใจเย็น',
    department: 'คลังสินค้า',
    leaveType: 'กิจ',
    startDate: isoOffset(0),
    endDate: isoOffset(1),
    reason: 'ไปดำเนินเรื่องเอกสารราชการที่ต่างจังหวัด',
    status: 'approved',
    createdAt: createdOffset(-3, 14, 20),
    approverId: 5,
  },

  /* ---------- อดีต ---------- */
  {
    id: 1003,
    employeeId: 2,
    employeeName: 'สุดา รักงาน',
    department: 'ฝ่ายขาย',
    leaveType: 'พักร้อน',
    startDate: isoOffset(-4),
    endDate: isoOffset(-2),
    reason: 'พาครอบครัวไปพักผ่อนต่างจังหวัด',
    status: 'approved',
    createdAt: createdOffset(-8, 10, 12),
    approverId: 1,
  },
  {
    id: 1004,
    employeeId: 9,
    employeeName: 'ธนกร เลขดี',
    department: 'บัญชี',
    leaveType: 'กิจ',
    startDate: isoOffset(-12),
    endDate: isoOffset(-11),
    reason: 'ไปงานแต่งญาติที่เชียงใหม่',
    status: 'rejected',
    createdAt: createdOffset(-15, 9, 0),
    approverId: 8,
  },

  /* ---------- Pending: พนักงานทั่วไป → manager ---------- */
  {
    id: 1005,
    employeeId: 4,
    employeeName: 'มานี มีสุข',
    department: 'ฝ่ายขาย',
    leaveType: 'ป่วย',
    startDate: isoOffset(2),
    endDate: isoOffset(3),
    reason: 'นัดผ่าฟันคุดที่โรงพยาบาล',
    status: 'pending',
    createdAt: createdOffset(-1, 16, 45),
    approverId: 1,
  },
  {
    id: 1006,
    employeeId: 7,
    employeeName: 'ทวี ทรัพย์ทวี',
    department: 'คลังสินค้า',
    leaveType: 'พักร้อน',
    startDate: isoOffset(6),
    endDate: isoOffset(8),
    reason: 'ลาพักผ่อนประจำปีกับครอบครัว',
    status: 'pending',
    createdAt: createdOffset(0, 9, 15),
    approverId: 5,
  },
  {
    id: 1007,
    employeeId: 10,
    employeeName: 'ปิยะ ขยันงาน',
    department: 'บัญชี',
    leaveType: 'พักร้อน',
    startDate: isoOffset(1),
    endDate: isoOffset(2),
    reason: 'ธุระส่วนตัวต่างจังหวัด',
    status: 'pending',
    createdAt: createdOffset(0, 11, 5),
    approverId: 8,
  },

  /* ---------- Pending: manager → hr_admin (อรุณี) ---------- */
  {
    id: 1008,
    employeeId: 1,
    employeeName: 'สมชาย ใจดี',
    department: 'ฝ่ายขาย',
    leaveType: 'พักร้อน',
    startDate: isoOffset(3),
    endDate: isoOffset(5),
    reason: 'พาครอบครัวไปเที่ยวทะเล',
    status: 'pending',
    createdAt: createdOffset(0, 8, 30),
    approverId: 11,
  },
  {
    id: 1009,
    employeeId: 5,
    employeeName: 'ประเสริฐ ตรงต่อเวลา',
    department: 'คลังสินค้า',
    leaveType: 'กิจ',
    startDate: isoOffset(4),
    endDate: isoOffset(4),
    reason: 'ประชุมสมาคมโลจิสติกส์',
    status: 'pending',
    createdAt: createdOffset(0, 10, 0),
    approverId: 11,
  },

  /* ---------- Pending: hr_admin → top management ---------- */
  {
    id: 1010,
    employeeId: 11,
    employeeName: 'อรุณี ดูแลคน',
    department: 'ฝ่ายบุคคล',
    leaveType: 'พักร้อน',
    startDate: isoOffset(7),
    endDate: isoOffset(10),
    reason: 'ลาพักร้อนประจำปี (รอ MD อนุมัติ)',
    status: 'pending',
    createdAt: createdOffset(0, 9, 0),
    approverId: 99,
  },

  /* ---------- Pending: employee ฝ่ายบุคคล ---------- */
  {
    id: 1011,
    employeeId: 12,
    employeeName: 'ชลธิชา รับสมัคร',
    department: 'ฝ่ายบุคคล',
    leaveType: 'ป่วย',
    startDate: isoOffset(1),
    endDate: isoOffset(1),
    reason: 'ตรวจสุขภาพประจำปี',
    status: 'pending',
    createdAt: createdOffset(0, 12, 0),
    approverId: 11,
  },
];