import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Dices, Heart, Trophy, LogOut, Menu, X,
  ChevronRight, Shield, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draws', icon: Dices, label: 'Draws' },
  { to: '/admin/charities', icon: Heart, label: 'Charities' },
  { to: '/admin/winners', icon: Trophy, label: 'Winners' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col bg-dark-800 border-r border-dark-600 h-full">
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-accent-gold rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-dark-900" />
            </div>
            <span className="font-display font-bold">Admin Panel</span>
          </div>
          <p className="text-xs text-dark-400">GolfCharity Platform</p>
        </div>

        <div className="p-4">
          <div className="px-3 py-2 bg-dark-700 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center text-xs font-bold text-accent-gold">
              {user?.firstName?.[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-accent-gold">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'sidebar-link-active mb-1 flex' : 'sidebar-link mb-1'}
            >
              <Icon size={17} />
              {label}
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-600 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors">
            <ArrowLeft size={15} /> User Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-dark-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-dark-600 z-50">
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}><X size={20} className="text-dark-300" /></button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-dark-700 bg-dark-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700">
            <Menu size={20} />
          </button>
          <Shield size={18} className="text-accent-gold" />
          <span className="font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
