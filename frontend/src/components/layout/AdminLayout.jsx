import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/students', label: 'Students', icon: '👥' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/enrollments', label: 'Enrollments', icon: '📝' },
  { to: '/admin/payments', label: 'Payments', icon: '💳' },
  { to: '/admin/certificates', label: 'Certificates', icon: '🎓' },
  { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link to="/admin/dashboard" className="font-heading font-bold text-lg text-navy-900">
            INFOLAB <span className="text-brand-accent">Admin</span>
          </Link>
        </div>

        <nav className="flex-grow p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-item ${location.pathname === item.to ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 text-sm text-gray-500 truncate">{user?.name}</div>
          <button onClick={handleLogout} className="sidebar-item w-full text-left">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
