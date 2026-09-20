import { useState } from 'react';
import infolabLogo from '../../assets/infolablogo.jpeg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/courses', label: 'Courses' },
    { to: '/contact', label: 'Contact' },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-white shadow-nav sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center h-12 py-2">
            <img src={infolabLogo} alt="INFOLAB Technology Services" className="h-full w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-brand-accent font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                  className="text-navy-900 font-medium hover:text-brand-accent"
                >
                  {user?.name || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-navy-900 font-medium hover:text-brand-accent"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-brand-accent text-white font-medium hover:bg-navy-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-navy-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 animate-slide-down">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-brand-accent font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="text-navy-900 font-medium py-2"
                  >
                    {user?.name || 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="text-left text-gray-700 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-navy-900 font-medium py-2">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-brand-accent font-medium py-2">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
