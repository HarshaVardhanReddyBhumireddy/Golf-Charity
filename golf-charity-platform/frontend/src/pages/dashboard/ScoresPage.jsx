import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Edit3, Check, X, Loader, Info } from 'lucide-react';
import { scoresAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];

export default function ScoresPage() {
  const { isSubscribed } = useAuth();
  const [scores, setScores] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ value: '', datePlayed: today(), course: '', notes: '' });
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await scoresAPI.get();
      setScores(r.data.scores || []);
      setAverage(r.data.average || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.value || form.value < 1 || form.value > 45) return toast.error('Score must be between 1 and 45');
    setSaving(true);
    try {
      const r = await scoresAPI.add({ ...form, value: Number(form.value) });
      setScores(r.data.scores);
      setForm({ value: '', datePlayed: today(), course: '', notes: '' });
      setAdding(false);
      toast.success('Score added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const r = await scoresAPI.delete(id);
      setScores(r.data.scores);
      toast.success('Score deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditForm({ value: s.value, datePlayed: s.datePlayed.split('T')[0], course: s.course || '', notes: s.notes || '' });
  };

  const handleEdit = async (id) => {
    setSaving(true);
    try {
      const r = await scoresAPI.update(id, { ...editForm, value: Number(editForm.value) });
      setScores(r.data.scores);
      setEditId(null);
      toast.success('Score updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const avg = scores.length ? (scores.reduce((s, x) => s + x.value, 0) / scores.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Scores</h1>
          <p className="text-dark-400 mt-1">Track your last 5 Stableford scores — these are your draw numbers</p>
        </div>
        {isSubscribed && scores.length < 5 && (
          <button onClick={() => setAdding(true)} className="btn-primary">
            <Plus size={16} /> Add Score
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="card p-4 border-accent-sky/20 bg-accent-sky/5 flex gap-3">
        <Info size={16} className="text-accent-sky flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <span className="text-white font-medium">How scores work: </span>
          Your 5 most recent scores (range 1–45 Stableford) are stored. Adding a 6th automatically replaces the oldest. These scores are your numbers in the monthly draw.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Scores stored', value: `${scores.length}/5` },
          { label: 'Average', value: avg || '—' },
          { label: 'Highest', value: scores.length ? Math.max(...scores.map(s => s.value)) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card text-center">
            <p className="text-dark-400 text-xs">{label}</p>
            <p className="font-display text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Add score form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 border-accent-lime/20"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Plus size={16} className="text-accent-lime" /> New Score Entry</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Stableford Score (1–45)</label>
                <input
                  type="number" min={1} max={45} className="input text-center text-xl font-bold"
                  placeholder="e.g. 36" value={form.value}
                  onChange={e => setForm(p => ({ ...p, value: e.target.value }))} required
                />
              </div>
              <div>
                <label className="label">Date played</label>
                <input type="date" className="input" value={form.datePlayed}
                  onChange={e => setForm(p => ({ ...p, datePlayed: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Course (optional)</label>
                <input type="text" className="input" placeholder="St Andrews" value={form.course}
                  onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
                  {saving ? <Loader size={15} className="animate-spin" /> : <><Check size={15} /> Save</>}
                </button>
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary py-3 px-4">
                  <X size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : scores.length === 0 ? (
        <div className="card p-16 text-center">
          <Target size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-300 mb-2">No scores recorded yet</p>
          {!isSubscribed ? (
            <p className="text-dark-500 text-sm">
              <Link to="/subscribe" className="text-accent-lime hover:underline">Subscribe</Link> to start tracking your scores
            </p>
          ) : (
            <button onClick={() => setAdding(true)} className="btn-primary mt-4">
              <Plus size={15} /> Add your first score
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-dark-300">{scores.length} score{scores.length !== 1 ? 's' : ''} stored (newest first)</p>
            {isSubscribed && scores.length === 5 && (
              <p className="text-xs text-dark-500">Max reached — adding a new score removes the oldest</p>
            )}
          </div>

          {scores.map((s, i) => (
            <motion.div
              key={s._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card overflow-hidden"
            >
              {editId === s._id ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input type="number" min={1} max={45} className="input" value={editForm.value}
                    onChange={e => setEditForm(p => ({ ...p, value: e.target.value }))} />
                  <input type="date" className="input" value={editForm.datePlayed}
                    onChange={e => setEditForm(p => ({ ...p, datePlayed: e.target.value }))} />
                  <input type="text" className="input" placeholder="Course" value={editForm.course}
                    onChange={e => setEditForm(p => ({ ...p, course: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s._id)} disabled={saving} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                      {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary py-2.5 px-3"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center font-display text-xl font-black text-accent-lime">
                    {s.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{s.course || 'Round played'}</p>
                    <p className="text-dark-400 text-sm">{format(new Date(s.datePlayed), 'EEEE dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-500 font-mono">Draw #{i + 1}</span>
                    {isSubscribed && (
                      <>
                        <button onClick={() => startEdit(s)} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Add more button */}
          {isSubscribed && scores.length < 5 && !adding && (
            <button onClick={() => setAdding(true)} className="w-full card p-4 text-center text-dark-400 hover:text-accent-lime hover:border-accent-lime/30 transition-all border-dashed">
              <Plus size={16} className="mx-auto mb-1" />
              <span className="text-sm">Add another score ({5 - scores.length} slot{5 - scores.length !== 1 ? 's' : ''} remaining)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
