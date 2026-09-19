import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RoleBadge } from '../components/Badge';

const ROLE_HOME: Record<string, string> = {
  manager: '/manager',
  hr_admin: '/hr',
  employee: '/employee',
};

export default function Login() {
  const { employees, login, user } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 👉 ไม่ให้ top_management ล็อกอิน
  const selectable = useMemo(
    () => employees.filter((e) => e.role !== 'top_management'),
    [employees]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof selectable>();
    for (const emp of selectable) {
      const list = map.get(emp.department) ?? [];
      list.push(emp);
      map.set(emp.department, list);
    }
    return Array.from(map.entries());
  }, [selectable]);

  const selectedEmployee = selectable.find((e) => e.id === Number(selectedId)) ?? null;

  if (user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/employee'} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployee) { setError('กรุณาเลือกผู้ใช้ก่อนเข้าสู่ระบบ'); return; }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      login(selectedEmployee.id);
      setLoading(false);
      navigate(ROLE_HOME[selectedEmployee.role] ?? '/employee', { replace: true });
    }, 500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
            HR
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            ระบบลงเวลา-ลางาน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            เข้าสู่ระบบด้วยบัญชีทดลอง (Mock Login)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="user-select" className="mb-1.5 block text-sm font-semibold text-slate-700">
                เลือกผู้ใช้
              </label>
              <select
                id="user-select"
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setError(''); }}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
              >
                <option value="">-- กรุณาเลือกผู้ใช้ --</option>
                {grouped.map(([dept, list]) => (
                  <optgroup key={dept} label={dept}>
                    {list.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.position}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {selectedEmployee ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selectedEmployee.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {selectedEmployee.position} · {selectedEmployee.department}
                    </p>
                  </div>
                  <RoleBadge role={selectedEmployee.role} />
                </div>
              ) : null}

              {error ? (
                <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : ('เข้าสู่ระบบ')}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          ข้อมูลทั้งหมดเป็น Mock Data เก็บใน localStorage ของเบราว์เซอร์
        </p>
      </div>
    </main>
  );
}