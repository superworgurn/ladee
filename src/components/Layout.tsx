import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/60 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.06),rgba(255,255,255,0))]" />
      
      <Topbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200/70 bg-white/50 backdrop-blur-sm py-5 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
          <span className="font-semibold text-slate-600">HR Portal System</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>Frontend-only (Mock Data + localStorage)</span>
        </div>
      </footer>
    </div>
  );
}