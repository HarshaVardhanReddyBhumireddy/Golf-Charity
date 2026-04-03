import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Calendar, ArrowLeft, Check, Loader } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { charitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CharityDetailPage() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [percent, setPercent] = useState(10);
  const { user, isSubscribed, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    charitiesAPI.getOne(id)
      .then(r => { setCharity(r.data.charity); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  const handleSelect = async () => {
    if (!user) { navigate('/login'); return; }
    if (!isSubscribed) { navigate('/subscribe'); return; }
    setSelecting(true);
    try {
      await charitiesAPI.select({ charityId: id, contributionPercent: percent });
      await refreshUser();
      toast.success(`${charity.name} is now your chosen charity!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to select charity');
    } finally {
      setSelecting(false);
    }
  };

  const isSelected = user?.selectedCharity?._id === id || user?.selectedCharity === id;

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-accent-lime border-t-transparent rounded-full" />
    </div>
  );

  if (!charity) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-dark-300 mb-4">Charity not found</p>
        <Link to="/charities" className="btn-secondary">Back to charities</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/charities" className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to charities
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-dark-700 to-dark-600 p-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center text-4xl mx-auto mb-4">
                  {charity.category === 'health' ? '🏥' : charity.category === 'sports' ? '⛳' : charity.category === 'environment' ? '🌿' : '💛'}
                </div>
                <span className="badge badge-active mb-3 capitalize">{charity.category}</span>
                <h1 className="font-display text-4xl font-bold text-white mb-2">{charity.name}</h1>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent-sky text-sm hover:underline">
                    <ExternalLink size={13} /> Visit website
                  </a>
                )}
              </div>

              <div className="p-8">
                <p className="text-dark-200 leading-relaxed text-lg mb-6">{charity.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dark-700 rounded-xl p-4">
                    <p className="text-dark-400 text-xs mb-1">Total Received</p>
                    <p className="font-display text-2xl font-bold text-white">£{charity.totalDonationsReceived?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-4">
                    <p className="text-dark-400 text-xs mb-1">Supporters</p>
                    <p className="font-display text-2xl font-bold text-white">{charity.subscriberCount || 0}</p>
                  </div>
                </div>

                {/* Select charity */}
                <div className="border border-dark-600 rounded-2xl p-6 bg-dark-700/50">
                  <h3 className="font-semibold text-white mb-4">Support this charity</h3>
                  <div className="mb-4">
                    <label className="label">Contribution percentage (min 10%)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={10} max={100} step={5}
                        value={percent}
                        onChange={e => setPercent(Number(e.target.value))}
                        className="flex-1 accent-accent-lime"
                      />
                      <span className="font-display text-2xl font-bold text-accent-lime w-16 text-right">{percent}%</span>
                    </div>
                    <p className="text-dark-400 text-xs mt-1">
                      {percent}% of your £20/mo = <span className="text-white font-semibold">£{(20 * percent / 100).toFixed(2)}/month</span> to {charity.name}
                    </p>
                  </div>
                  <button onClick={handleSelect} disabled={selecting || isSelected} className={`w-full justify-center py-3 ${isSelected ? 'btn-secondary opacity-60' : 'btn-primary'}`}>
                    {selecting ? <Loader size={16} className="animate-spin" /> : isSelected ? <><Check size={16} /> Currently selected</> : <><Heart size={16} /> Select this charity</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Events */}
            {charity.events?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-2">
                  <Calendar size={20} className="text-accent-lime" /> Upcoming Events
                </h2>
                <div className="space-y-4">
                  {charity.events.map((ev, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-dark-700 rounded-xl">
                      <div className="w-12 h-12 bg-accent-lime/10 border border-accent-lime/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-accent-lime font-bold">{new Date(ev.date).toLocaleString('en', { month: 'short' })}</span>
                        <span className="text-lg font-black text-white leading-none">{new Date(ev.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{ev.title}</p>
                        {ev.location && <p className="text-dark-400 text-sm">📍 {ev.location}</p>}
                        {ev.description && <p className="text-dark-300 text-sm mt-1">{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
