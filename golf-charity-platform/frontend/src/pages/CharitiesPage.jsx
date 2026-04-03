import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ArrowRight, Filter } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { charitiesAPI } from '../services/api';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'sports', 'community', 'international', 'other'];
const ICONS = { health: '🏥', sports: '⛳', environment: '🌿', education: '📚', community: '🤝', international: '🌍', other: '💛' };

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, search: search || undefined, category: category !== 'all' ? category : undefined };
      const res = await charitiesAPI.getAll(params);
      setCharities(res.data.charities);
      setPagination(res.data.pagination);
    } catch {
      setCharities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [search, category]);
  useEffect(() => { fetch(); }, [search, category, page]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
              <Heart size={14} className="fill-red-400" /> Charity Directory
            </p>
            <h1 className="section-title mb-4">Choose your cause</h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Every subscription powers change. Select the charity closest to your heart and watch your rounds make a real difference.
            </p>
          </motion.div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search charities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize
                    ${category === c ? 'bg-accent-lime text-dark-900' : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-dark-700 rounded-xl mb-4" />
                  <div className="h-3 bg-dark-700 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-dark-700 rounded w-full mb-1" />
                  <div className="h-3 bg-dark-700 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : charities.length === 0 ? (
            <div className="text-center py-20 text-dark-400">
              <Heart size={40} className="mx-auto mb-4 opacity-30" />
              <p>No charities found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((ch, i) => (
                <motion.div
                  key={ch._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-hover p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl">
                      {ICONS[ch.category] || '💛'}
                    </div>
                    {ch.isFeatured && (
                      <span className="badge bg-accent-lime/10 text-accent-lime border border-accent-lime/20 text-xs">Featured</span>
                    )}
                  </div>
                  <span className="text-xs text-dark-400 uppercase tracking-wide mb-1 capitalize">{ch.category}</span>
                  <h3 className="font-semibold text-white text-lg mb-2">{ch.name}</h3>
                  <p className="text-dark-300 text-sm flex-1 line-clamp-3 leading-relaxed mb-4">{ch.shortDescription || ch.description}</p>
                  {ch.events?.length > 0 && (
                    <p className="text-xs text-accent-sky mb-3">📅 {ch.events.length} upcoming event{ch.events.length > 1 ? 's' : ''}</p>
                  )}
                  <Link to={`/charities/${ch._id}`} className="mt-auto flex items-center gap-1.5 text-accent-lime text-sm font-medium hover:gap-3 transition-all">
                    View charity <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-accent-lime text-dark-900' : 'bg-dark-700 text-dark-300 hover:text-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
