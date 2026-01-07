import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Mail,
  Users,
  LogOut,
  Heart,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/campaigns', icon: Mail, label: 'Campaigns' },
    { path: '/audiences', icon: Users, label: 'Audiences' },
    { path: '/revenue', icon: TrendingUp, label: 'Revenue' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Marketing Buddy</h1>
              <p className="text-xs text-gray-500">Email Marketing</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.email || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
