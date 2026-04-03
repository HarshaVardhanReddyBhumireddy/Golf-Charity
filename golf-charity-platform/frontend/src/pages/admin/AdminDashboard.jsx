import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Coins, Heart, Trophy, TrendingUp, UserCheck, Dices } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
    </div>
  );

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-accent-sky' },
    { icon: UserCheck, label: 'Active Subscribers', value: stats?.activeSubscribers || 0, color: 'text-accent-lime' },
    { icon: Coins, label: 'Monthly Revenue', value: `£${parseFloat(stats?.monthlyRevenue || 0).toFixed(0)}`, color: 'text-accent-gold' },
    { icon: Heart, label: 'Total Donations', value: `£${parseFloat(stats?.totalDonations || 0).toFixed(0)}`, color: 'text-red-400' },
    { icon: Trophy, label: 'Total Prize Pool', value: `£${parseFloat(stats?.totalPrizePoolPaid || 0).toFixed(0)}`, color: 'text-accent-gold' },
    { icon: Dices, label: 'Draws Run', value: stats?.totalDrawsRun || 0, color: 'text-accent-lime' },
    { icon: Heart, label: 'Charities Listed', value: stats?.totalCharities || 0, color: 'text-red-400' },
    { icon: TrendingUp, label: 'Active Rate', value: `${stats?.totalUsers ? Math.round((stats.activeSubscribers / stats.totalUsers) * 100) : 0}%`, color: 'text-accent-sky' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-dark-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <Icon size={18} className={color} />
            <p className="text-dark-400 text-xs">{label}</p>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent draws + users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent draws */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Dices size={16} className="text-accent-lime" /> Recent Draws</h2>
          {stats?.recentDraws?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentDraws.map(draw => (
                <div key={draw._id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">Draw #{draw.drawNumber}</p>
                    <p className="text-xs text-dark-400">{draw.month}/{draw.year} · {draw.activeSubscriberCount} subscribers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent-lime">£{draw.prizePool?.total?.toFixed(0)}</p>
                    <span className={`badge text-xs ${draw.status === 'published' ? 'badge-active' : 'badge-pending'}`}>{draw.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">No draws yet</p>
          )}
        </div>

        {/* Recent users */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Users size={16} className="text-accent-lime" /> Recent Signups</h2>
          {stats?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 py-2 border-b border-dark-600 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-300">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-dark-400">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge text-xs ${u.subscription?.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                      {u.subscription?.status || 'inactive'}
                    </span>
                    <p className="text-xs text-dark-500 mt-0.5">{format(new Date(u.createdAt), 'dd MMM')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
