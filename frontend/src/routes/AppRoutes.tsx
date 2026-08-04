import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { loadMe, logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
const Login = lazy(() => import('../pages/LoginPage'));
const Dashboard = lazy(() => import('../pages/DashboardPage'));
const Properties = lazy(() => import('../pages/PropertiesPage'));
const PropertyDetail = lazy(() => import('../pages/PropertyDetailPage'));
const PropertyForm = lazy(() => import('../pages/PropertyFormPage'));
const Applications = lazy(() => import('../pages/ApplicationsPage'));
const Maintenance = lazy(() => import('../pages/MaintenancePage'));
const NotFound = lazy(() => import('../pages/NotFoundPage'));
const Guard = () => {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <AppShell /> : <Navigate to="/login" replace />;
};
export const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  useEffect(() => {
    if (token) void dispatch(loadMe());
    const handler = () => dispatch(logout());
    window.addEventListener('leasepilot:unauthorized', handler);
    return () => window.removeEventListener('leasepilot:unauthorized', handler);
  }, [dispatch, token]);
  return (
    <Suspense fallback={<div className="loader" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route
            path="properties/new"
            element={role === 'landlord' ? <PropertyForm /> : <Navigate to="/properties" />}
          />
          <Route
            path="properties/:id/edit"
            element={role === 'landlord' ? <PropertyForm /> : <Navigate to="/properties" />}
          />
          <Route path="applications" element={<Applications />} />
          <Route path="maintenance" element={<Maintenance />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
