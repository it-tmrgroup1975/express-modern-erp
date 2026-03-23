import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // ถ้าไม่มี Token ให้ส่งกลับไปหน้า Login
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี Token ให้แสดงหน้าลูก (เช่น Dashboard, Reports)
  return <Outlet />;
}