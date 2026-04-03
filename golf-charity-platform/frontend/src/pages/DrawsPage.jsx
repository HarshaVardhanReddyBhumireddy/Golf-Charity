import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { drawsAPI } from '../services/api';
import { format } from 'date-fns';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DrawBall({ n }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-lime/80 to-accent-lime flex items-center justify-center font-mono font-bold text-dark-900 text-sm shadow-lg">
      {n}
    </div>
  );
}

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([drawsAPI.getPublished(), drawsAPI.getUpcoming()])
      .then(([d, u]) => { setDraws(d.data.draws || []); setUpcoming(u.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-accent-gold text-sm font-semibold tracking-widest uppercase mb-3">Monthly Draw</p>
            <h1 className="section-title mb-4">The Prize <span className="text-gradient-gold">Draw</span></h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Every month, 5 numbers are drawn. Match yours to win. Your Stableford scores are your lottery numbers — play more, win more.
            </p>
          </motion.div>

          {/* How the draw works */}
          <div className="card p-8 mb-10">
            <h2 className="font-display text-2xl font-bold mb-6">How the draw works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: '01', title: 'Your scores are your numbers', desc: 'Each of your 5 Stableford scores (1–45) becomes a draw entry number.' },
                { n: '02', title: '5 numbers are drawn monthly', desc: 'Admin draws 5 random or algorithmic numbers from the 1–45 range.' },
                { n: '03', title: 'Match to win prizes', desc: 'Match 3 = 25% pool, Match 4 = 35% pool, Match 5 = 40% jackpot!' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <span className="font-mono text-4xl font-black text-accent-lime/20 leading-none">{n}</span>
                  <div>
                    <p className="font-semibold text-white mb-1">{title}</p>
                    <p className="text-dark-300 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming draw teaser */}
          {upcoming?.draw && (
            <div className="card border-accent-lime/20 bg-accent-lime/3 p-8 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
                <span className="text-accent-lime text-sm font-semibold">Next Draw</span>
              </div>
              <h3 className="font-display text-3xl font-bold mb-2">
                {MONTH_NAMES[upcoming.draw.month - 1]} {upcoming.draw.year} Draw
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-dark-300">
                <span className="flex items-center gap-1.5"><Users size={14} /> {upcoming.estimatedActiveSubscribers} subscribers</span>
                <span className="flex items-center gap-1.5"><Coins size={14} /> Est. prize pool: £{upcoming.draw.prizePool?.total?.toFixed(0) || '—'}</span>
              </div>
            </div>
          )}

          {/* Past draws */}
          <h2 className="font-display text-3xl font-bold mb-6">Past Draw Results</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
            </div>
          ) : draws.length === 0 ? (
            <div className="card p-12 text-center text-dark-400">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p>No published draws yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {draws.map((draw, i) => (
                <motion.div
                  key={draw._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === draw._id ? null : draw._id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-dark-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                        <Trophy size={18} className="text-accent-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Draw #{draw.drawNumber} — {MONTH_NAMES[draw.month - 1]} {draw.year}</p>
                        <p className="text-dark-400 text-sm">
                          {draw.winners?.length || 0} winner{draw.winners?.length !== 1 ? 's' : ''} · Prize pool: £{draw.prizePool?.total?.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {draw.drawnNumbers?.map(n => <DrawBall key={n} n={n} />)}
                      </div>
                      {expanded === draw._id ? <ChevronUp size={16} className="text-dark-400" /> : <ChevronDown size={16} className="text-dark-400" />}
                    </div>
                  </button>

                  {expanded === draw._id && (
                    <div className="border-t border-dark-600 p-6">
                      {draw.winners?.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-dark-300 mb-3">Winners</p>
                          {draw.winners.map((w, wi) => (
                            <div key={wi} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                              <div>
                                <span className={`badge mr-2 ${w.matchType === '5-match' ? 'badge-active' : 'badge-pending'}`}>{w.matchType}</span>
                                <span className="text-sm text-dark-200">
                                  {w.user?.firstName} {w.user?.lastName} ({w.user?.country})
                                </span>
                              </div>
                              <span className="font-semibold text-accent-lime">£{w.prizeAmount?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-dark-400 text-sm text-center py-4">No winners for this draw.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
