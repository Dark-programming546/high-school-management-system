import { useState } from 'react';
import { Alert, FormGroup, Button } from './UI.jsx';

export default function ChangePassword({ onSubmit, forced = false }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match');
    try {
      setSaving(true);
      await onSubmit({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
      {forced && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded mb-4">
          ⚠️ You must change your password before continuing.
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">🔒 Change Password</h2>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <form onSubmit={handleSubmit} className="space-y-3">
        <FormGroup label="Current Password">
          <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} className={inp} required />
        </FormGroup>
        <FormGroup label="New Password">
          <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} className={inp} required />
        </FormGroup>
        <FormGroup label="Confirm New Password">
          <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className={inp} required />
        </FormGroup>
        <Button type="submit" loading={saving}>Change Password</Button>
      </form>
    </div>
  );
}
