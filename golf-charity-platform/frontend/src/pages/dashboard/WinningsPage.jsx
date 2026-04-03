import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Upload, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import { winnersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-400', badge: 'badge-pending', label: 'Proof required' },
  verified: { icon: CheckCircle, color: 'text-blue-400', badge: 'badge-paid', label: 'Verified' },
  paid: { icon: CheckCircle, color: 'text-emerald-400', badge: 'badge-active', label: 'Paid' },
  rejected: { icon: XCircle, color: 'text-red-400', badge: 'badge-rejected', label: 'Rejected' },
};

export default function WinningsPage() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    winnersAPI.getMy()
      .then(r => setWinnings(r.data.winnings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (drawId, winnerId, file) => {
    const fd = new FormData();
    fd.append('proof', file);
    setUploading(winnerId);
    try {
      await winnersAPI.uploadProof(drawId, winnerId, fd);
      toast.success('Proof uploaded! Admin will verify shortly.');
      const r = await winnersAPI.getMy();
      setWinnings(r.data.winnings || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(null); }
  };

  const total = winnings.reduce((s, w) => s + (w.prizeAmount || 0), 0);
  const paid = winnings.filter(w => w.paymentStatus === 'paid').reduce((s, w) => s + w.prizeAmount, 0);
  const pending = winnings.filter(w => w.paymentStatus === 'pending' || w.paymentStatus === 'verified').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">My Winnings</h1>
        <p className="text-dark-400 mt-1">Track your prize history and claim verification</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total won', value: `£${total.toFixed(2)}` },
          { label: 'Paid out', value: `£${paid.toFixed(2)}` },
          { label: 'Pending', value: pending },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card text-center">
            <p className="text-dark-400 text-xs">{label}</p>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : winnings.length === 0 ? (
        <div className="card p-16 text-center">
          <Trophy size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-300 mb-1">No winnings yet</p>
          <p className="text-dark-500 text-sm">Keep playing — your scores are your lottery tickets!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winnings.map((w, i) => {
            const cfg = STATUS_CONFIG[w.paymentStatus] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={`${w.drawId}-${w.winnerId}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                      <Trophy size={20} className="text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Draw #{w.drawNumber} — {MONTH_NAMES[w.month - 1]} {w.year}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${w.matchType === '5-match' ? 'badge-active' : 'badge-pending'} capitalize`}>{w.matchType}</span>
                        <span className={`badge ${cfg.badge}`}><StatusIcon size={10} className="mr-1" />{cfg.label}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {w.drawnNumbers?.map(n => (
                          <span key={n} className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${w.matchedNumbers?.includes(n) ? 'bg-accent-lime text-dark-900' : 'bg-dark-700 text-dark-300'}`}>{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-black text-accent-lime">£{w.prizeAmount?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Proof upload */}
                {w.paymentStatus === 'pending' && !w.proofImageUrl && (
                  <div className="mt-4 pt-4 border-t border-dark-600">
                    <p className="text-sm text-dark-300 mb-3">Upload a screenshot of your golf scores as proof to claim your prize.</p>
                    <label className="btn-primary cursor-pointer text-sm py-2.5">
                      {uploading === w.winnerId ? <Loader size={14} className="animate-spin" /> : <><Upload size={14} /> Upload proof</>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(w.drawId, w.winnerId, e.target.files[0])} disabled={!!uploading} />
                    </label>
                  </div>
                )}

                {w.proofImageUrl && w.paymentStatus === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-dark-600">
                    <p className="text-xs text-amber-400 flex items-center gap-1.5"><Clock size={12} /> Proof submitted — awaiting admin review</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
