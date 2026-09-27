import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const links = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/scan', label: '🔍 Scan' },
    { path: '/history', label: '📋 History' },
    { path: '/analytics', label: '📈 Analytics' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-lg font-bold text-violet-700">
              🛡️ DataShield AI
            </Link>
            <div className="hidden md:flex space-x-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    location.pathname === link.path
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
