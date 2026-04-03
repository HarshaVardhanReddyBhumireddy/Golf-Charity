import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Target, Heart, Trophy, Settings,
  LogOut, Menu, X, ChevronRight, Crown, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/scores', icon: Target, label: 'My Scores' },
  { to: '/dashboard/charity', icon: Heart, label: 'My Charity' },
  { to: '/dashboard/winnings', icon: Trophy, label: 'Winnings' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} flex-col bg-dark-800 border-r border-dark-600 h-full`}>
      {/* Logo */}
      <div className="p-6 border-b border-dark-600">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-lime rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-dark-900" />
          </div>
          <span className="font-display font-bold text-lg">Golf<span className="text-accent-lime">Charity</span></span>
        </NavLink>
      </div>

      {/* User card */}
      <div className="p-4 mx-4 my-3 bg-dark-700 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-lime/20 border border-accent-lime/30 flex items-center justify-center font-bold text-accent-lime text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user?.firstName} {user?.lastName}</p>
            <div className="mt-0.5">
              {isSubscribed
                ? <span className="badge-active text-xs">✦ Active</span>
                : <span className="badge-inactive text-xs">No plan</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
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

        {isAdmin && (
          <>
            <hr className="border-dark-600 my-3" />
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'sidebar-link-active mb-1 flex' : 'sidebar-link mb-1'}>
              <Shield size={17} className="text-accent-gold" />
              <span className="text-accent-gold">Admin Panel</span>
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-dark-600">
        {!isSubscribed && (
          <NavLink to="/subscribe" className="w-full mb-3 btn-primary justify-center text-sm py-2.5 flex">
            <Crown size={15} /> Upgrade Plan
          </NavLink>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-red-400 hover:bg-red-500/5 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-dark-800 border-r border-dark-600 flex flex-col z-50"
          >
            <div className="flex justify-end p-4"><button onClick={() => setSidebarOpen(false)}><X size={20} className="text-dark-300" /></button></div>
            <Sidebar mobile />
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-dark-700 bg-dark-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold">Golf<span className="text-accent-lime">Charity</span></span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
