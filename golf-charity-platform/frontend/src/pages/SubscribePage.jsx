import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Trophy, Crown, Loader, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export default function SubscribePage() {
  const [selected, setSelected] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { user, isSubscribed, refreshUser } = useAuth();
  const navigate = useNavigate();

  const plans = {
    monthly: { label: 'Monthly', price: 20, interval: '/month', savings: null, badge: null },
    yearly: { label: 'Yearly', price: 192, interval: '/year', monthly: 16, savings: '£48 saving', badge: 'Best Value' },
  };

  const features = [
    'Monthly prize draw entry',
    'Score tracking (5 rolling)',
    'Charity contribution (min 10%)',
    'Winner verification system',
    'Cancel anytime',
    'Priority draw notifications',
  ];

  const handleSubscribe = async () => {
    if (!user) { navigate('/register'); return; }
    setLoading(true);
    try {
      // Dev mode: manual activate for testing
      if (import.meta.env.DEV) {
        await subscriptionsAPI.manualActivate({ plan: selected });
        await refreshUser();
        toast.success('Subscription activated (dev mode)!');
        navigate('/dashboard');
        return;
      }
      const res = await subscriptionsAPI.checkout(selected);
      window.location.href = res.data.sessionUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-lime/10 border border-accent-lime/20 rounded-full text-accent-lime text-xs font-medium mb-4">
            <Crown size={12} /> Join the platform
          </span>
          <h1 className="font-display text-5xl font-black mb-4">
            Choose your <span className="text-gradient">plan</span>
          </h1>
          <p className="text-dark-300 text-lg">Play for good. Win prizes. Fund charities you love.</p>
        </motion.div>

        {isSubscribed && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-300 text-sm">
              You already have an active <span className="font-semibold capitalize">{user?.subscription?.plan}</span> subscription.{' '}
              <Link to="/dashboard" className="underline hover:text-white">Go to dashboard →</Link>
            </p>
          </div>
        )}

        {/* Plan toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {Object.entries(plans).map(([key, plan]) => (
            <motion.div
              key={key}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(key)}
              className={`card p-6 cursor-pointer transition-all duration-200 relative overflow-hidden
                ${selected === key ? 'border-accent-lime/50 bg-accent-lime/5' : 'hover:border-dark-400'}`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-accent-gold text-dark-900 text-xs font-bold rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className={`w-5 h-5 rounded-full border-2 mb-4 flex items-center justify-center transition-colors
                ${selected === key ? 'border-accent-lime bg-accent-lime' : 'border-dark-400'}`}>
                {selected === key && <Check size={11} className="text-dark-900" strokeWidth={3} />}
              </div>

              <p className="text-dark-400 text-sm font-medium mb-1">{plan.label}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-4xl font-black text-white">£{plan.price}</span>
                <span className="text-dark-400 text-sm mb-1.5">{plan.interval}</span>
              </div>
              {plan.monthly && (
                <p className="text-accent-lime text-sm">£{plan.monthly}/mo — <span className="font-semibold">{plan.savings}</span></p>
              )}
              {!plan.monthly && <p className="text-dark-400 text-sm">Billed monthly</p>}
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="card p-6 mb-8">
          <p className="text-sm font-semibold text-dark-300 mb-4 uppercase tracking-wide">Everything included</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-accent-lime/15 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-accent-lime" strokeWidth={3} />
                </div>
                <span className="text-dark-200">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary text-base px-10 py-4 glow-lime"
          >
            {loading
              ? <Loader size={18} className="animate-spin" />
              : <>Subscribe {selected === 'yearly' ? 'yearly' : 'monthly'} — £{plans[selected].price} <ArrowRight size={18} /></>
            }
          </button>

          <div className="flex items-center justify-center gap-2 text-dark-400 text-xs">
            <Shield size={12} />
            <span>Secure payment via Stripe · Cancel anytime · No hidden fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
