import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  /** ถ้าไม่ส่งมา = อนุญาตทุก role ที่ล็อกอินแล้ว */
  allow?: Role[];
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(user.role)) {
    const fallback = user.role === 'manager' ? '/manager' : '/employee';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}