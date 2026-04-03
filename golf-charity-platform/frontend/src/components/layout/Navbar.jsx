import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Trophy, Heart, LayoutDashboard, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, logout, isAdmin, isSubscribed } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: 'Charities', to: '/charities' },
    { label: 'Monthly Draw', to: '/draws' },
    { label: 'Subscribe', to: '/subscribe', highlight: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-md border-b border-dark-700' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent-lime rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={16} className="text-dark-900" />
            </div>
            <span className="font-display font-bold text-lg">
              Golf<span className="text-accent-lime">Charity</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={link.highlight
                  ? 'ml-2 px-4 py-2 bg-accent-lime text-dark-900 text-sm font-semibold rounded-lg hover:bg-accent-lime/90 transition-colors'
                  : `px-4 py-2 text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-accent-lime' : 'text-dark-300 hover:text-white'}`
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-dark-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-accent-lime/20 border border-accent-lime/30 flex items-center justify-center text-xs font-bold text-accent-lime">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-white">{user.firstName}</span>
                  <ChevronDown size={14} className={`text-dark-300 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-2xl"
                      onMouseLeave={() => setDropOpen(false)}
                    >
                      <div className="p-2">
                        {isSubscribed && (
                          <div className="px-3 py-1.5 mb-1">
                            <span className="badge-active text-xs">✦ Active Subscriber</span>
                          </div>
                        )}
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link to="/dashboard/charity" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                          <Heart size={14} /> My Charity
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-accent-lime hover:bg-accent-lime/10 transition-colors">
                            <Shield size={14} /> Admin Panel
                          </Link>
                        )}
                        <Link to="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
                          <Settings size={14} /> Settings
                        </Link>
                        <hr className="border-dark-600 my-1" />
                        <button onClick={() => { logout(); navigate('/'); setDropOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors px-4 py-2">Sign in</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(p => !p)} className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-colors">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/98 border-b border-dark-700 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${link.highlight ? 'bg-accent-lime text-dark-900' : 'text-dark-200 hover:text-white hover:bg-dark-700'}`}>
                  {link.label}
                </Link>
              ))}
              <hr className="border-dark-700 my-2" />
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-sm text-dark-200 hover:bg-dark-700">Dashboard</Link>
                  {isAdmin && <Link to="/admin" className="block px-4 py-3 rounded-xl text-sm text-accent-lime hover:bg-accent-lime/10">Admin Panel</Link>}
                  <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 rounded-xl text-sm text-dark-200 hover:bg-dark-700">Sign in</Link>
                  <Link to="/register" className="block px-4 py-3 rounded-xl text-sm bg-accent-lime text-dark-900 font-semibold">Get started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
