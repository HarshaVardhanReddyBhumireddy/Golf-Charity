// MyCharityPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Check, Loader, ArrowRight, ExternalLink } from 'lucide-react';
import { charitiesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyCharityPage() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [percent, setPercent] = useState(user?.charityContributionPercent || 10);
  const [selected, setSelected] = useState(user?.selectedCharity?._id || user?.selectedCharity || null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charitiesAPI.getAll({ limit: 20, search: search || undefined })
      .then(r => setCharities(r.data.charities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const handleSave = async () => {
    if (!selected) return toast.error('Please select a charity');
    setSaving(true);
    try {
      await usersAPI.updateCharityContribution({ charityId: selected, percent });
      await refreshUser();
      toast.success('Charity updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const monthly = ((user?.subscription?.monthlyFee || 20) * percent / 100).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">My Charity</h1>
        <p className="text-dark-400 mt-1">Choose where your contribution goes every month</p>
      </div>

      {/* Current impact */}
      {user?.selectedCharity && (
        <div className="card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={20} className="text-red-400 fill-red-400" />
            <p className="font-semibold text-white">Current charity</p>
          </div>
          <p className="text-xl font-display font-bold">{user.selectedCharity?.name || 'Selected charity'}</p>
          <p className="text-dark-300 text-sm mt-1">You donate <span className="text-white font-semibold">£{monthly}/month</span> ({percent}% of subscription)</p>
        </div>
      )}

      {/* Contribution slider */}
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4">Contribution percentage</h3>
        <div className="flex items-center gap-4 mb-2">
          <input type="range" min={10} max={100} step={5} value={percent}
            onChange={e => setPercent(Number(e.target.value))}
            className="flex-1 accent-accent-lime" />
          <span className="font-display text-3xl font-black text-accent-lime w-20 text-right">{percent}%</span>
        </div>
        <p className="text-dark-400 text-sm">= <span className="text-white font-semibold">£{monthly}/month</span> donated to your chosen charity</p>
      </div>

      {/* Charity picker */}
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4">Choose a charity</h3>
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" className="input pl-10 text-sm" placeholder="Search charities..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {loading ? <p className="text-dark-400 text-sm text-center py-4">Loading...</p> : charities.map(ch => (
            <button key={ch._id} onClick={() => setSelected(ch._id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${selected === ch._id ? 'bg-accent-lime/10 border border-accent-lime/30' : 'bg-dark-700 hover:bg-dark-600'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected === ch._id ? 'border-accent-lime bg-accent-lime' : 'border-dark-400'}`}>
                {selected === ch._id && <Check size={11} className="text-dark-900" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">{ch.name}</p>
                <p className="text-xs text-dark-400 capitalize">{ch.category}</p>
              </div>
              {ch.isFeatured && <span className="text-xs text-accent-lime">✦</span>}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3 justify-between items-center">
          <Link to="/charities" className="text-sm text-dark-400 hover:text-accent-lime flex items-center gap-1">Browse all <ExternalLink size={12} /></Link>
          <button onClick={handleSave} disabled={saving || !selected} className="btn-primary py-2.5">
            {saving ? <Loader size={15} className="animate-spin" /> : <><Check size={15} /> Save selection</>}
          </button>
        </div>
      </div>
    </div>
  );
}
