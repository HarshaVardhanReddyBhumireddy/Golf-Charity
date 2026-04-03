import { useState } from 'react';
import { User, Lock, CreditCard, Loader, Check, AlertTriangle } from 'lucide-react';
import { authAPI, subscriptionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, refreshUser, isSubscribed } = useAuth();
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', country: user?.country || 'GB', handicap: user?.handicap || 0 });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setSavingPassword(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure? Your subscription will remain active until the end of the billing period.')) return;
    setCancelling(true);
    try {
      await subscriptionsAPI.cancel();
      await refreshUser();
      toast.success('Subscription set to cancel at period end');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally { setCancelling(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Account Settings</h1>
        <p className="text-dark-400 mt-1">Manage your profile, security and subscription</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2"><User size={17} className="text-accent-lime" /> Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First name</label><input type="text" className="input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div><label className="label">Last name</label><input type="text" className="input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
          </div>
          <div><label className="label">Email address</label><input type="text" className="input opacity-50 cursor-not-allowed" value={user?.email || ''} disabled /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Phone (optional)</label><input type="text" className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className="label">Handicap</label><input type="number" className="input" min={-10} max={54} value={profile.handicap} onChange={e => setProfile(p => ({ ...p, handicap: Number(e.target.value) }))} /></div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary py-2.5">
              {savingProfile ? <Loader size={15} className="animate-spin" /> : <><Check size={15} /> Save changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2"><Lock size={17} className="text-accent-lime" /> Change Password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div><label className="label">Current password</label><input type="password" className="input" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
          <div><label className="label">New password</label><input type="password" className="input" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} minLength={6} required /></div>
          <div><label className="label">Confirm new password</label><input type="password" className="input" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required /></div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="btn-primary py-2.5">
              {savingPassword ? <Loader size={15} className="animate-spin" /> : <><Check size={15} /> Update password</>}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2"><CreditCard size={17} className="text-accent-lime" /> Subscription</h2>
        {isSubscribed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-dark-700 p-3 rounded-xl"><p className="text-dark-400 text-xs mb-1">Plan</p><p className="font-semibold capitalize">{user.subscription.plan}</p></div>
              <div className="bg-dark-700 p-3 rounded-xl"><p className="text-dark-400 text-xs mb-1">Status</p><span className="badge-active capitalize">{user.subscription.status}</span></div>
              <div className="bg-dark-700 p-3 rounded-xl"><p className="text-dark-400 text-xs mb-1">Monthly fee</p><p className="font-semibold">£{user.subscription.monthlyFee}/mo</p></div>
              <div className="bg-dark-700 p-3 rounded-xl"><p className="text-dark-400 text-xs mb-1">Renews</p><p className="font-semibold">{user.subscription.currentPeriodEnd ? format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy') : '—'}</p></div>
            </div>
            {user.subscription.cancelAtPeriodEnd ? (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300">
                <AlertTriangle size={14} /> Subscription cancels on {format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy')}
              </div>
            ) : (
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger">
                {cancelling ? <Loader size={14} className="animate-spin" /> : 'Cancel subscription'}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-dark-400 mb-4">You don't have an active subscription</p>
            <a href="/subscribe" className="btn-primary">Subscribe now</a>
          </div>
        )}
      </div>
    </div>
  );
}
