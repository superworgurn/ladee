import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import LeaveForm from './pages/LeaveForm';
import LeaveHistory from './pages/LeaveHistory';
import ApprovalList from './pages/ApprovalList';
import WorkingToday from './pages/WorkingToday';

function RootRedirect() {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* สาธารณะ */}
      <Route path="/login" element={<Login />} />

      {/* ต้องล็อกอินก่อน */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/leave/new" element={<LeaveForm />} />
          <Route path="/leave/history" element={<LeaveHistory />} />

          {/* เฉพาะ manager */}
          <Route element={<ProtectedRoute allow={['manager']} />}>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/approvals" element={<ApprovalList />} />
          </Route>
        </Route>
      </Route>

      {/* หน้าแรก + 404 */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/working-today" element={<WorkingToday />} />
      <Route path="/hr/approvals" element={<ApprovalList />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}