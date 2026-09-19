import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RoleBadge } from './Badge';
import { getRequestsToApprove } from '../utils/approval';

interface NavItem { to: string; label: string; badge?: number; }

export function Topbar() {
  const { user, logout, leaveRequests } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const pendingForMe = getRequestsToApprove(leaveRequests, user).length;

  let navItems: NavItem[] = [];

  if (user.role === 'employee') {
    navItems = [
      { to: '/employee', label: 'แดชบอร์ด' },
      { to: '/leave/new', label: 'ขอลา' },
      { to: '/leave/history', label: 'ประวัติการลา' },
      { to: '/working-today', label: 'ใครทำงานวันนี้' },
    ];
  } else if (user.role === 'manager') {
    navItems = [
      { to: '/manager', label: 'แดชบอร์ด' },
      { to: '/manager/approvals', label: 'อนุมัติคำขอลา', badge: pendingForMe },
      { to: '/leave/new', label: 'ขอลา' },
      { to: '/leave/history', label: 'ประวัติการลา' },
      { to: '/working-today', label: 'ใครทำงานวันนี้' },
    ];
  } else if (user.role === 'hr_admin') {
    navItems = [
      { to: '/hr', label: 'แดชบอร์ด HR' },
      { to: '/hr/approvals', label: 'อนุมัติคำขอลา', badge: pendingForMe },
      { to: '/leave/new', label: 'ขอลา' },
      { to: '/leave/history', label: 'ประวัติการลา' },
      { to: '/working-today', label: 'ใครทำงานวันนี้' },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
              HR
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">ระบบลงเวลา-ลางาน</p>
              <p className="text-[11px] text-slate-500">{user.position}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.department}</p>
            </div>
            <RoleBadge role={user.role} />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <nav className="-mb-px flex gap-1 overflow-x-auto pb-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  'relative whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
                ].join(' ')
              }
            >
              {item.label}
              {item.badge ? (
                <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}