import React, { useState, useEffect, FormEvent } from 'react';
import { GraduationCap, TrendingUp, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../context/ToastContext';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-indigo-neon-600/20 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile, loading, error, saveProfile } = useProfile();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    major: '',
    year: '',
    targetGpa: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        major: profile.major || '',
        year: profile.year || '',
        targetGpa: profile.target_gpa ? profile.target_gpa.toString() : '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveProfile({
        major: formData.major,
        year: formData.year,
        target_gpa: formData.targetGpa ? parseFloat(formData.targetGpa) : null,
      });
      showSuccess('Profile updated successfully!');
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-glass rounded-2xl" />
            <div className="h-96 bg-glass rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !profile) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <Card variant="glass" className="border-danger/30 bg-danger/5">
            <div className="flex gap-4">
              <AlertCircle className="text-danger flex-shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold mb-1">Failed to load profile</h3>
                <p className="text-gray-400 text-sm">Please try refreshing the page</p>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const currentGpa = profile?.current_gpa || 0;
  const targetGpa = parseFloat(formData.targetGpa) || 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your academic profile and settings</p>
        </div>

        {/* User Info Card */}
        <Card variant="elevated" className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
            <Badge variant="info">Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-void-700">
            <StatItem
              icon={<TrendingUp size={20} className="text-indigo-neon-600" />}
              label="Current GPA"
              value={currentGpa.toFixed(2)}
            />
            <StatItem
              icon={<GraduationCap size={20} className="text-indigo-neon-600" />}
              label="Academic Year"
              value={formData.year || 'Not set'}
            />
            <StatItem
              icon={<BookOpen size={20} className="text-indigo-neon-600" />}
              label="Major"
              value={formData.major || 'Not set'}
            />
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card variant="glass">
          <h3 className="text-2xl font-bold text-white mb-6">Edit Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                type="text"
                value={user?.first_name || ''}
                disabled
                variant="underline"
              />
              <Input
                label="Last Name"
                type="text"
                value={user?.last_name || ''}
                disabled
                variant="underline"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              variant="underline"
            />

            <Input
              label="Major"
              type="text"
              name="major"
              placeholder="e.g., Computer Science"
              variant="underline"
              value={formData.major}
              onChange={handleChange}
            />

            <Input
              label="Academic Year"
              type="text"
              name="year"
              placeholder="e.g., Junior"
              variant="underline"
              value={formData.year}
              onChange={handleChange}
            />

            <Input
              label="Target GPA"
              type="number"
              name="targetGpa"
              placeholder="e.g., 3.8"
              variant="underline"
              min="0"
              max="4"
              step="0.01"
              value={formData.targetGpa}
              onChange={handleChange}
            />

            <div className="flex gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};
