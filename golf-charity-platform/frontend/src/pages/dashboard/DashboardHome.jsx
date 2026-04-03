import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Heart, Trophy, Crown, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { scoresAPI, drawsAPI, winnersAPI } from '../../services/api';
import { format } from 'date-fns';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardHome() {
  const { user, isSubscribed } = useAuth();
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [upcoming, setUpcoming] = useState(null);

  useEffect(() => {
    scoresAPI.get().then(r => setScores(r.data.scores || [])).catch(() => {});
    winnersAPI.getMy().then(r => setWinnings(r.data.winnings || [])).catch(() => {});
    drawsAPI.getUpcoming().then(r => setUpcoming(r.data)).catch(() => {});
  }, []);

  const totalWon = winnings.reduce((s, w) => s + (w.prizeAmount || 0), 0);
  const pending = winnings.filter(w => w.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back, {user?.firstName} 👋</h1>
          <p className="text-dark-400 mt-1">
            {isSubscribed
              ? `Your ${user?.subscription?.plan} plan is active until ${user?.subscription?.currentPeriodEnd ? format(new Date(user.subscription.currentPeriodEnd), 'MMM d, yyyy') : '—'}`
              : 'Subscribe to enter monthly draws and win prizes'
            }
          </p>
        </div>
        {!isSubscribed && (
          <Link to="/subscribe" className="btn-primary hidden sm:flex">
            <Crown size={16} /> Subscribe
          </Link>
        )}
      </div>

      {/* Subscription banner */}
      {!isSubscribed && (
        <div className="card border-accent-lime/20 bg-accent-lime/5 p-5 flex items-center gap-4">
          <Crown size={28} className="text-accent-lime flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-white">You're not subscribed yet</p>
            <p className="text-dark-300 text-sm">Subscribe from £20/month to enter draws, track scores, and support charities.</p>
          </div>
          <Link to="/subscribe" className="btn-primary text-sm py-2">Subscribe <ArrowRight size={14} /></Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Scores logged', value: scores.length, max: '/5', color: 'text-accent-lime', link: '/dashboard/scores' },
          { icon: Trophy, label: 'Total won', value: `£${totalWon.toFixed(0)}`, color: 'text-accent-gold', link: '/dashboard/winnings' },
          { icon: Heart, label: 'Draws entered', value: user?.drawsEntered || 0, color: 'text-red-400', link: null },
          { icon: TrendingUp, label: 'Avg score', value: scores.length ? (scores.reduce((s, x) => s + x.value, 0) / scores.length).toFixed(1) : '—', color: 'text-accent-sky', link: '/dashboard/scores' },
        ].map(({ icon: Icon, label, value, max, color, link }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <Icon size={18} className={color} />
            <p className="text-dark-400 text-xs">{label}</p>
            <p className="font-display text-2xl font-bold text-white">
              {value}{max && <span className="text-dark-500 text-base font-normal">{max}</span>}
            </p>
            {link && (
              <Link to={link} className="text-xs text-dark-400 hover:text-accent-lime flex items-center gap-1 mt-1 transition-colors">
                View all <ArrowRight size={10} />
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent scores */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2"><Target size={17} className="text-accent-lime" /> My Scores</h2>
            <Link to="/dashboard/scores" className="text-xs text-dark-400 hover:text-accent-lime transition-colors flex items-center gap-1">
              Manage <ArrowRight size={11} />
            </Link>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <Target size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-3">No scores yet</p>
              {isSubscribed && (
                <Link to="/dashboard/scores" className="btn-primary text-sm py-2">Add your first score</Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 5).map((s, i) => (
                <div key={s._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-accent-lime/10 flex items-center justify-center font-bold text-accent-lime text-sm">
                    {s.value}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{s.course || 'Round played'}</p>
                    <p className="text-xs text-dark-400">{format(new Date(s.datePlayed), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs text-dark-400 font-mono">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming draw */}
          {upcoming?.draw && (
            <div className="card p-5 border-accent-lime/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
                <span className="text-xs text-accent-lime font-semibold uppercase tracking-wide">Next Draw</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">
                {MONTH_NAMES[upcoming.draw.month - 1]} {upcoming.draw.year}
              </p>
              <p className="text-dark-400 text-sm mt-1">Est. prize pool: £{upcoming.draw.prizePool?.total?.toFixed(0) || '—'}</p>
              <div className="mt-3 pt-3 border-t border-dark-600">
                <p className="text-xs text-dark-400">Your draw numbers:</p>
                {scores.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {scores.map(s => (
                      <span key={s._id} className="w-8 h-8 rounded-full bg-accent-lime/15 border border-accent-lime/30 flex items-center justify-center text-xs font-bold text-accent-lime">{s.value}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-500 mt-1">Add scores to enter the draw</p>
                )}
              </div>
            </div>
          )}

          {/* Charity */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Heart size={14} className="text-red-400" /> My Charity</h3>
              <Link to="/dashboard/charity" className="text-xs text-dark-400 hover:text-accent-lime"><ArrowRight size={11} /></Link>
            </div>
            {user?.selectedCharity ? (
              <div>
                <p className="font-medium text-white text-sm">{user.selectedCharity?.name || 'Selected'}</p>
                <p className="text-dark-400 text-xs mt-1">{user.charityContributionPercent}% of your subscription</p>
                <p className="text-accent-lime text-xs mt-0.5">= £{(20 * user.charityContributionPercent / 100).toFixed(2)}/month donated</p>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-dark-400 text-xs mb-2">No charity selected</p>
                <Link to="/charities" className="text-accent-lime text-xs hover:underline">Browse charities →</Link>
              </div>
            )}
          </div>

          {/* Pending winnings */}
          {pending > 0 && (
            <div className="card p-5 border-accent-gold/20 bg-accent-gold/5">
              <Trophy size={20} className="text-accent-gold mb-2" />
              <p className="font-semibold text-white text-sm">You have {pending} pending win{pending > 1 ? 's' : ''}!</p>
              <p className="text-dark-300 text-xs mt-1">Upload proof to claim your prize.</p>
              <Link to="/dashboard/winnings" className="btn-primary text-xs py-2 mt-3 w-full justify-center">
                Claim now <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
