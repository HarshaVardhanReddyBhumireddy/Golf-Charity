import { useState, useEffect } from 'react';
import { Heart, Plus, Edit3, Trash2, X, Check, Loader, Star } from 'lucide-react';
import { charitiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['health', 'education', 'environment', 'sports', 'community', 'international', 'other'];
const blank = { name: '', description: '', shortDescription: '', category: 'health', country: 'GB', isFeatured: false, website: '', tags: '' };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | {id, data}
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await charitiesAPI.getAll({ limit: 50 });
      setCharities(r.data.charities || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (ch) => {
    setForm({ ...ch, tags: (ch.tags || []).join(', ') });
    setModal({ id: ch._id });
  };

  const openCreate = () => { setForm(blank); setModal('create'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      if (modal === 'create') await charitiesAPI.create(data);
      else await charitiesAPI.update(modal.id, data);
      toast.success(modal === 'create' ? 'Charity created!' : 'Charity updated!');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await charitiesAPI.delete(id);
      toast.success('Charity deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Charities</h1>
          <p className="text-dark-400 mt-1">{charities.length} active charities</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Charity</button>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative card p-6 w-full max-w-xl my-8">
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-white">{modal === 'create' ? 'Add Charity' : 'Edit Charity'}</h3>
              <button onClick={() => setModal(null)}><X size={18} className="text-dark-400" /></button>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div><label className="label">Name *</label><input type="text" className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="label">Short description (max 200 chars)</label><input type="text" className="input" maxLength={200} value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} /></div>
              <div><label className="label">Full description *</label><textarea className="input min-h-24 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Country</label>
                  <input type="text" className="input" maxLength={2} placeholder="GB" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div><label className="label">Website</label><input type="url" className="input" placeholder="https://..." value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div>
              <div><label className="label">Tags (comma separated)</label><input type="text" className="input" placeholder="health, research, uk" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-accent-lime" />
                <span className="text-sm text-white">Featured charity (shown on homepage)</span>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader size={15} className="animate-spin" /> : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map(ch => (
            <div key={ch._id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{ch.name}</p>
                    {ch.isFeatured && <Star size={12} className="text-accent-gold fill-accent-gold" />}
                  </div>
                  <p className="text-xs text-dark-400 capitalize">{ch.category} · {ch.country}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(ch)} className="p-1.5 rounded bg-dark-700 text-dark-300 hover:text-white"><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(ch._id, ch.name)} className="p-1.5 rounded bg-dark-700 text-dark-300 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-dark-300 text-xs flex-1 line-clamp-2">{ch.shortDescription || ch.description}</p>
              <div className="mt-3 pt-3 border-t border-dark-600 flex items-center justify-between text-xs text-dark-500">
                <span>£{ch.totalDonationsReceived?.toFixed(0) || 0} raised</span>
                <span>{ch.subscriberCount || 0} supporters</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
