import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RoleBadge } from './Badge';
import { getRequestsToApprove } from '../utils/approval';

export default function Topbar() {
  const { user, leaveRequests, logout } = useApp();
  const location = useLocation();

  const pendingCount = useMemo(() => {
    if (!user) return 0;
    return getRequestsToApprove(leaveRequests, user).length;
  }, [leaveRequests, user]);

  if (!user) return null;

  const approvalPath = user.role === 'hr_admin' ? '/hr/approvals' : '/manager/approvals';

  const navItems = [
    { label: 'แดชบอร์ด', path: '/' },
    ...(user.role === 'manager' || user.role === 'hr_admin'
      ? [{ label: 'อนุมัติคำขอลา', path: approvalPath, badge: pendingCount }]
      : []),
    { label: 'ขอลา', path: '/leave' },
    { label: 'ประวัติการลา', path: '/leave/history' },
    { label: 'ประวัติลงเวลา', path: '/attendance' },
    { label: 'ใครทำงานวันนี้', path: '/working-today' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-xs">
              HR
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                ระบบลงเวลา-ลางาน
              </div>
              <div className="text-xs text-slate-500">
                {user.position || user.department}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">
                {user.department}{' '}
                {user.role !== 'hr_admin' && (
                  <span>· วันลาคงเหลือ {user.leaveBalance} วัน</span>
                )}
              </div>
            </div>

            <RoleBadge role={user.role} />

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <nav className="flex space-x-1 overflow-x-auto border-t border-slate-100 pt-1 -mb-px">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  'inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                ].join(' ')}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}