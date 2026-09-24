import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';

// โหลดคอมโพเนนต์แบบ Dynamic Import แยก Chunk รายหน้า
const Login = lazy(() => import('./pages/Login'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const HRAdminDashboard = lazy(() => import('./pages/HRAdminDashboard'));
const LeaveForm = lazy(() => import('./pages/LeaveForm'));
const LeaveHistory = lazy(() => import('./pages/LeaveHistory'));
const ApprovalList = lazy(() => import('./pages/ApprovalList'));
const WorkingToday = lazy(() => import('./pages/WorkingToday'));
const AttendanceHistory = lazy(() => import('./pages/AttendanceHistory'));

// แสดงตัวโหลดระหว่างสลับหน้า
function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-xs font-medium text-slate-400">กำลังโหลดข้อมูล...</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'hr_admin' || user.role === 'top_management') {
      return <HRAdminDashboard />;
    }
    if (user.role === 'manager') {
      return <ManagerDashboard />;
    }
    return <EmployeeDashboard />;
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {user ? (
          <Route element={<Layout />}>
            <Route path="/" element={renderDashboard()} />
            <Route path="/leave" element={<LeaveForm />} />
            <Route path="/leave/history" element={<LeaveHistory />} />
            <Route path="/history" element={<Navigate to="/leave/history" replace />} />
            <Route path="/attendance" element={<AttendanceHistory />} />
            <Route path="/approvals" element={<ApprovalList />} />
            <Route path="/manager/approvals" element={<ApprovalList />} />
            <Route path="/hr/approvals" element={<ApprovalList />} />
            <Route path="/working-today" element={<WorkingToday />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}