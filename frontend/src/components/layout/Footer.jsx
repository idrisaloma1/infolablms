import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-gray-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-xl text-white mb-3">
              INFOLAB <span className="text-brand-accent">LMS</span>
            </h3>
            <p className="text-sm text-gray-400">
              Learning management, built for Nigerian schools and institutions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-brand-accent transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-accent transition-colors">About</Link></li>
              <li><Link to="/courses" className="hover:text-brand-accent transition-colors">Courses</Link></li>
              <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-brand-accent transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-accent transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p className="text-sm text-gray-400">Lagos, Nigeria</p>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-6 text-sm text-gray-500 text-center">
          © {year} Infolab Technology Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
