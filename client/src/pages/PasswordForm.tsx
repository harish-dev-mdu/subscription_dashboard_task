import { Lock } from 'lucide-react';
import api from '../lib/axios';
import { useState } from 'react';

const PasswordForm = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return isChangingPassword ? (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div>
        <label className="label">Current Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="input pl-10"
            placeholder="Enter current password"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="input pl-10"
            placeholder="Enter new password"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="input pl-10"
            placeholder="Confirm new password"
            required
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary btn-md inline-flex items-center gap-2">
          <Save className="w-4 h-4" />
          Update Password
        </button>
        <button type="button" onClick={() => setIsChangingPassword(false)} className="btn-secondary btn-md">
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Keep your account secure with a strong password
      </p>
      <button onClick={() => setIsChangingPassword(true)} className="btn-secondary btn-sm">
        Change Password
      </button>
    </div>
  );
};