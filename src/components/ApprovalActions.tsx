import { useApp } from '../context/AppContext';
import type { LeaveRequest } from '../types';
import { canApprove, getApprovalBlockReason } from '../utils/approval';

interface ApprovalActionsProps {
  request: LeaveRequest;
  onDecision: (id: number, status: 'approved' | 'rejected') => void;
  busy?: boolean;
  compact?: boolean;
}

export function ApprovalActions({
  request,
  onDecision,
  busy = false,
  compact = false,
}: ApprovalActionsProps) {
  const { user, employees } = useApp();

  const allowed = canApprove(request, user);
  const blockReason = allowed
    ? null
    : getApprovalBlockReason(request, user, employees);

  if (!allowed) {
    return (
      <div
        className={`flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 ${compact ? '' : 'mt-2'}`}
      >
        <span className="text-sm leading-none">⚠️</span>
        <p className="flex-1">{blockReason ?? 'ไม่สามารถดำเนินการได้'}</p>
      </div>
    );
  }

  return (
    <div className={compact ? 'flex gap-2' : 'flex gap-2 sm:flex-col'}>
      <button
        type="button"
        onClick={() => onDecision(request.id, 'approved')}
        disabled={busy}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-60 sm:min-w-[110px]"
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : ('✓')}
        อนุมัติ
      </button>
      <button
        type="button"
        onClick={() => onDecision(request.id, 'rejected')}
        disabled={busy}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:opacity-60 sm:min-w-[110px]"
      >
        ✕ ปฏิเสธ
      </button>
    </div>
  );
}