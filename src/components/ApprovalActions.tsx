import { useState } from 'react';
import type { LeaveRequest } from '../types';

export interface ApprovalActionsProps {
  request: LeaveRequest;
  onDecision: (id: number, status: 'approved' | 'rejected', reason?: string) => void;
  busy?: boolean;
  isSelfRequest?: boolean;
}

export function ApprovalActions({
  request,
  onDecision,
  busy = false,
  isSelfRequest = false,
}: ApprovalActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // กรณีเป็นคำขอของตนเอง (หัวหน้าส่งหา HR)
  if (isSelfRequest) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
        <span>👔</span> คำขอส่งถึง HR แล้ว (รอ HR อนุมัติ)
      </span>
    );
  }

  const handleConfirmReject = () => {
    onDecision(request.id, 'rejected', rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDecision(request.id, 'approved')}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'กำลังบันทึก...' : '✓ อนุมัติ'}
        </button>
        <button
          type="button"
          onClick={() => setShowRejectModal(true)}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 hover:border-rose-200 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          ✕ ปฏิเสธ
        </button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              ระบุเหตุผลการไม่อนุมัติ
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              คำขอของ {request.employeeName} (ลา{request.leaveType})
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="กรอกเหตุผลเพื่อแจ้งให้พนักงานทราบ..."
              className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}