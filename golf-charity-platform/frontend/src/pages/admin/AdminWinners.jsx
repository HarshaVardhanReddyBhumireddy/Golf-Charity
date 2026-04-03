import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, XCircle, DollarSign, Loader, Filter } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending: 'badge-pending',
  verified: 'badge-paid',
  paid: 'badge-active',
  rejected: 'badge-rejected',
};

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getWinners({ status: statusFilter || undefined });
      setWinners(r.data.winners || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (drawId, winnerId, status) => {
    setUpdating(winnerId);
    try {
      await adminAPI.updateWinnerStatus(drawId, winnerId, { paymentStatus: status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setUpdating(null); }
  };

  const total = winners.reduce((s, w) => s + (w.prizeAmount || 0), 0);
  const paid = winners.filter(w => w.paymentStatus === 'paid').reduce((s, w) => s + w.prizeAmount, 0);
  const pending = winners.filter(w => w.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Winners & Payouts</h1>
        <p className="text-dark-400 mt-1">Verify proofs and manage prize payouts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total prizes', value: `£${total.toFixed(2)}` },
          { label: 'Paid out', value: `£${paid.toFixed(2)}` },
          { label: 'Awaiting proof', value: pending },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card text-center">
            <p className="text-dark-400 text-xs">{label}</p>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'verified', 'paid', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors
              ${statusFilter === s ? 'bg-accent-lime text-dark-900' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Winners table */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : winners.length === 0 ? (
        <div className="card p-12 text-center text-dark-400">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p>No winners{statusFilter ? ` with status "${statusFilter}"` : ''}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                {['Winner', 'Draw', 'Match', 'Prize', 'Status', 'Proof', 'Actions'].map(h => <th key={h} className="th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {winners.map((w, i) => (
                <tr key={`${w.drawId}-${w.winnerId}-${i}`} className="table-row">
                  <td className="td">
                    <p className="font-medium">{w.user?.firstName} {w.user?.lastName}</p>
                    <p className="text-xs text-dark-400">{w.user?.email}</p>
                  </td>
                  <td className="td">
                    <p className="text-sm">#{w.drawNumber}</p>
                    <p className="text-xs text-dark-400">{MONTH_NAMES[w.month - 1]} {w.year}</p>
                  </td>
                  <td className="td">
                    <span className={`badge ${w.matchType === '5-match' ? 'badge-active' : 'badge-pending'}`}>{w.matchType}</span>
                  </td>
                  <td className="td font-semibold text-accent-lime">£{w.prizeAmount?.toFixed(2)}</td>
                  <td className="td">
                    <span className={`badge ${STATUS_COLORS[w.paymentStatus]}`}>{w.paymentStatus}</span>
                  </td>
                  <td className="td">
                    {w.proofImageUrl ? (
                      <a href={w.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-sky hover:underline">View proof</a>
                    ) : (
                      <span className="text-xs text-dark-500">Not submitted</span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex gap-1.5 flex-wrap">
                      {w.paymentStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(w.drawId, w.winnerId, 'verified')}
                            disabled={!!updating}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Verify"
                          >
                            {updating === w.winnerId ? <Loader size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                          </button>
                          <button
                            onClick={() => updateStatus(w.drawId, w.winnerId, 'rejected')}
                            disabled={!!updating}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {w.paymentStatus === 'verified' && (
                        <button
                          onClick={() => updateStatus(w.drawId, w.winnerId, 'paid')}
                          disabled={!!updating}
                          className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Mark as paid"
                        >
                          {updating === w.winnerId ? <Loader size={13} className="animate-spin" /> : <DollarSign size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
