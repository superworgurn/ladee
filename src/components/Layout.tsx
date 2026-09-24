import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Topbar from './Topbar';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // ซ่อนปุ่มย้อนกลับเมื่ออยู่ที่หน้าแรก (/) หรือหน้าล็อกอิน
  const isHomePage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900 antialiased">
      {/* Navbar ส่วนบน */}
      <Topbar />

      {/* พื้นที่แสดงเนื้อหาของแต่ละหน้า */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* ปุ่มย้อนกลับ แสดงอัตโนมัติในทุกหน้าย่อย */}
        {!isHomePage && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>ย้อนกลับ</span>
            </button>
          </div>
        )}

        {children || <Outlet />}
      </main>
    </div>
  );
}