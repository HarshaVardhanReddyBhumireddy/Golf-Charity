import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Trophy, ArrowRight, Loader, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', country: 'GB' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.firstName}! Let's set up your account.`);
      navigate('/subscribe');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = ['Monthly prize draws', 'Choose your charity', 'Track your scores', 'Cancel anytime'];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent-lime/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent-lime rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-dark-900" />
          </div>
          <span className="font-display font-bold text-xl">Golf<span className="text-accent-lime">Charity</span></span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-3xl font-bold mb-1">Create your account</h1>
          <p className="text-dark-300 text-sm mb-2">Join 1,240+ golfers playing for good</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {perks.map(p => (
              <span key={p} className="flex items-center gap-1.5 text-xs text-dark-300 bg-dark-700 px-2.5 py-1 rounded-full">
                <Check size={10} className="text-accent-lime" /> {p}
              </span>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input type="text" className="input" placeholder="John" value={form.firstName} onChange={e => up('firstName', e.target.value)} required />
              </div>
              <div>
                <label className="label">Last name</label>
                <input type="text" className="input" placeholder="Birdie" value={form.lastName} onChange={e => up('lastName', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => up('email', e.target.value)} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => up('password', e.target.value)}
                  required minLength={6}
                />
                <button type="button" onClick={() => setShow(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Country</label>
              <select className="input" value={form.country} onChange={e => up('country', e.target.value)}>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="IE">🇮🇪 Ireland</option>
                <option value="US">🇺🇸 United States</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="ZA">🇿🇦 South Africa</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
              {loading ? <Loader size={16} className="animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-dark-500 text-xs text-center mt-4">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-5 pt-5 border-t border-dark-600 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-lime hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
