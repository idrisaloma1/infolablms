import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Spinner ───────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ── Student/User Protected Route ──────────────────────────
export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// ── Admin Protected Route ─────────────────────────────────
export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/student/dashboard" replace />;
  return children;
}

// ── Guest Only Route (redirect if logged in) ──────────────
export function GuestRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return <Spinner />;
  if (isLoggedIn) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
}
