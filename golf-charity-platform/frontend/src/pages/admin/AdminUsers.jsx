import { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Edit3, X, Loader, Check, Eye } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [viewingScores, setViewingScores] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getUsers({ page, search: search || undefined, status: statusFilter || undefined });
      setUsers(r.data.users);
      setPagination(r.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { load(); }, [search, statusFilter, page]);

  const startEdit = (u) => {
    setEditing(u._id);
    setEditData({ firstName: u.firstName, lastName: u.lastName, email: u.email, isActive: u.isActive, 'subscription.status': u.subscription?.status });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await adminAPI.updateUser(id, editData);
      toast.success('User updated');
      setEditing(null);
      load();
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  const viewScores = async (userId) => {
    try {
      const r = await adminAPI.getUser(userId);
      setViewingScores({ user: r.data.user, scores: r.data.scores });
    } catch { toast.error('Failed to load scores'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-dark-400 mt-1">{pagination.total || 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" className="input pl-10 text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input text-sm w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-700">
            <tr>
              {['User', 'Email', 'Plan', 'Status', 'Draws', 'Joined', 'Actions'].map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-dark-600">
                  {Array(7).fill(0).map((__, j) => <td key={j} className="td"><div className="h-4 bg-dark-700 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="td text-center py-12 text-dark-400">No users found</td></tr>
            ) : users.map(u => (
              editing === u._id ? (
                <tr key={u._id} className="border-b border-dark-600 bg-dark-700/30">
                  <td className="td">
                    <input type="text" className="input text-xs py-1.5 w-24" value={editData.firstName} onChange={e => setEditData(p => ({ ...p, firstName: e.target.value }))} />
                  </td>
                  <td className="td">
                    <input type="email" className="input text-xs py-1.5 w-40" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} />
                  </td>
                  <td className="td">
                    <select className="input text-xs py-1.5 w-28" value={editData['subscription.status']} onChange={e => setEditData(p => ({ ...p, 'subscription.status': e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="td">
                    <select className="input text-xs py-1.5 w-20" value={editData.isActive} onChange={e => setEditData(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                      <option value="true">Active</option>
                      <option value="false">Banned</option>
                    </select>
                  </td>
                  <td className="td" colSpan={2} />
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(u._id)} disabled={saving} className="p-1.5 rounded bg-accent-lime/10 text-accent-lime hover:bg-accent-lime/20">
                        {saving ? <Loader size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded bg-dark-600 text-dark-300 hover:text-white"><X size={13} /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={u._id} className="table-row">
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-300">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="td text-dark-300">{u.email}</td>
                  <td className="td capitalize text-sm">{u.subscription?.plan || '—'}</td>
                  <td className="td">
                    <span className={`badge ${u.subscription?.status === 'active' ? 'badge-active' : u.subscription?.status === 'cancelled' ? 'badge-rejected' : 'badge-inactive'}`}>
                      {u.subscription?.status || 'inactive'}
                    </span>
                  </td>
                  <td className="td">{u.drawsEntered || 0}</td>
                  <td className="td text-dark-400 text-xs">{format(new Date(u.createdAt), 'dd MMM yy')}</td>
                  <td className="td">
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit(u)} className="p-1.5 rounded bg-dark-600 text-dark-300 hover:text-white hover:bg-dark-500 transition-colors"><Edit3 size={13} /></button>
                      <button onClick={() => viewScores(u._id)} className="p-1.5 rounded bg-dark-600 text-dark-300 hover:text-accent-sky hover:bg-accent-sky/10 transition-colors"><Eye size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-dark-400 text-sm">Showing {users.length} of {pagination.total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 px-3 disabled:opacity-40"><ChevronLeft size={15} /></button>
            <span className="px-4 py-2 text-sm text-dark-300">Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 px-3 disabled:opacity-40"><ChevronRight size={15} /></button>
          </div>
        </div>
      )}

      {/* Scores modal */}
      {viewingScores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setViewingScores(null)} />
          <div className="relative card p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Scores — {viewingScores.user.firstName} {viewingScores.user.lastName}</h3>
              <button onClick={() => setViewingScores(null)}><X size={18} className="text-dark-400" /></button>
            </div>
            {viewingScores.scores?.length > 0 ? (
              <div className="space-y-2">
                {viewingScores.scores.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed)).map(s => (
                  <div key={s._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                    <span className="w-10 h-10 rounded-xl bg-accent-lime/15 flex items-center justify-center font-bold text-accent-lime">{s.value}</span>
                    <div>
                      <p className="text-sm font-medium">{s.course || 'Round'}</p>
                      <p className="text-xs text-dark-400">{format(new Date(s.datePlayed), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-dark-400 text-center py-8">No scores</p>}
          </div>
        </div>
      )}
    </div>
  );
}
