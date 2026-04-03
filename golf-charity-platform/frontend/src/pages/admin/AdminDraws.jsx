import { useState, useEffect } from 'react';
import { Dices, Plus, Play, Send, Loader, ChevronDown, ChevronUp, X } from 'lucide-react';
import { drawsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function DrawBall({ n, highlight }) {
  return (
    <span className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center
      ${highlight ? 'bg-accent-lime text-dark-900 shadow-lg' : 'bg-dark-600 text-dark-200'}`}>{n}</span>
  );
}

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDraw, setNewDraw] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random' });
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await drawsAPI.adminGetAll();
      setDraws(r.data.draws || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setActionLoading('create');
    try {
      await drawsAPI.create(newDraw);
      toast.success('Draw created!');
      setCreating(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create draw');
    } finally { setActionLoading(null); }
  };

  const handleSimulate = async (id) => {
    setActionLoading(id + '-sim');
    try {
      const r = await drawsAPI.simulate(id);
      toast.success('Simulation complete!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Simulation failed');
    } finally { setActionLoading(null); }
  };

  const handlePublish = async (id) => {
    if (!confirm('Publish this draw? This will notify all winners and cannot be undone.')) return;
    setActionLoading(id + '-pub');
    try {
      const r = await drawsAPI.publish(id);
      toast.success(r.data.message || 'Draw published!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publish failed');
    } finally { setActionLoading(null); }
  };

  const statusBadge = (s) => {
    const map = { upcoming: 'badge-inactive', simulation: 'badge-pending', published: 'badge-active', completed: 'badge-paid' };
    return <span className={`badge ${map[s] || 'badge-inactive'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Draw Management</h1>
          <p className="text-dark-400 mt-1">Configure, simulate and publish monthly draws</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary"><Plus size={16} /> New Draw</button>
      </div>

      {/* Create draw modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setCreating(false)} />
          <div className="relative card p-6 w-full max-w-md">
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-white">Create New Draw</h3>
              <button onClick={() => setCreating(false)}><X size={18} className="text-dark-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Month</label>
                  <select className="input" value={newDraw.month} onChange={e => setNewDraw(p => ({ ...p, month: Number(e.target.value) }))}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input type="number" className="input" value={newDraw.year} onChange={e => setNewDraw(p => ({ ...p, year: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="label">Draw type</label>
                <select className="input" value={newDraw.drawType} onChange={e => setNewDraw(p => ({ ...p, drawType: e.target.value }))}>
                  <option value="random">Random (lottery-style)</option>
                  <option value="algorithmic">Algorithmic (frequency-weighted)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCreating(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleCreate} disabled={actionLoading === 'create'} className="btn-primary flex-1 justify-center">
                  {actionLoading === 'create' ? <Loader size={15} className="animate-spin" /> : 'Create Draw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draws list */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : draws.length === 0 ? (
        <div className="card p-12 text-center text-dark-400">
          <Dices size={40} className="mx-auto mb-3 opacity-30" />
          <p>No draws yet. Create your first draw to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {draws.map(draw => (
            <div key={draw._id} className="card overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-lime/10 border border-accent-lime/20 rounded-xl flex items-center justify-center">
                    <Dices size={18} className="text-accent-lime" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">Draw #{draw.drawNumber} — {MONTHS[draw.month - 1]} {draw.year}</p>
                      {statusBadge(draw.status)}
                    </div>
                    <p className="text-dark-400 text-sm">
                      {draw.activeSubscriberCount} subscribers · £{draw.prizePool?.total?.toFixed(0)} pool · {draw.drawType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {draw.drawnNumbers?.length > 0 && (
                    <div className="flex gap-1 mr-2">
                      {draw.drawnNumbers.map(n => <DrawBall key={n} n={n} highlight />)}
                    </div>
                  )}

                  {draw.status === 'upcoming' && (
                    <button onClick={() => handleSimulate(draw._id)} disabled={!!actionLoading} className="btn-secondary text-sm py-2">
                      {actionLoading === draw._id + '-sim' ? <Loader size={14} className="animate-spin" /> : <><Play size={13} /> Simulate</>}
                    </button>
                  )}
                  {(draw.status === 'upcoming' || draw.status === 'simulation') && (
                    <button onClick={() => handlePublish(draw._id)} disabled={!!actionLoading} className="btn-primary text-sm py-2">
                      {actionLoading === draw._id + '-pub' ? <Loader size={14} className="animate-spin" /> : <><Send size={13} /> Publish</>}
                    </button>
                  )}

                  <button onClick={() => setExpanded(expanded === draw._id ? null : draw._id)} className="p-2 text-dark-400">
                    {expanded === draw._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Simulation / winner details */}
              {expanded === draw._id && (
                <div className="border-t border-dark-600 p-5">
                  {draw.simulationResults && (
                    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-amber-300 text-sm font-semibold mb-2">Simulation Results (not yet official)</p>
                      <div className="grid grid-cols-3 gap-3 text-xs text-center">
                        {[['5-Match', draw.simulationResults.fiveMatches], ['4-Match', draw.simulationResults.fourMatches], ['3-Match', draw.simulationResults.threeMatches]].map(([label, count]) => (
                          <div key={label} className="bg-dark-700 p-2 rounded-lg">
                            <p className="text-dark-400">{label}</p>
                            <p className="text-white font-bold text-lg">{count}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {draw.simulationResults.drawnNumbers?.map(n => <DrawBall key={n} n={n} highlight />)}
                      </div>
                    </div>
                  )}

                  {draw.winners?.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-dark-300 mb-3">Winners ({draw.winners.length})</p>
                      <div className="space-y-2">
                        {draw.winners.map((w, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl text-sm">
                            <div>
                              <p className="font-medium">{w.user?.firstName} {w.user?.lastName}</p>
                              <p className="text-dark-400 text-xs">{w.user?.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`badge ${w.matchType === '5-match' ? 'badge-active' : 'badge-pending'}`}>{w.matchType}</span>
                              <span className="font-semibold text-accent-lime">£{w.prizeAmount?.toFixed(2)}</span>
                              <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-active' : w.paymentStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>{w.paymentStatus}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : draw.status === 'published' ? (
                    <p className="text-dark-400 text-sm">No winners for this draw.</p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
