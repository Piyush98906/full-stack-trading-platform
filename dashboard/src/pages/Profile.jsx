import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { getAvatarColor } from '../utils/format';

function Profile() {
  const navigate = useNavigate();
  const { refreshUser, logout, user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', pan: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile');
      setProfile(data.profile);
      setProfileForm({
        name: data.profile.name || '',
        phone: data.profile.phone || '',
        pan: data.profile.pan || ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      await api.put('/profile', profileForm);
      await refreshUser();
      addToast('Profile saved successfully!', 'success');
      fetchProfile();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save profile', 'error');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    try {
      await api.put('/profile/password', passwordForm);
      addToast('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  return (
    <div className="page-stack">
      <section className="content-grid two-col">
        <article className="panel-card">
          <div className="profile-head">
            <div className="profile-avatar" style={{ backgroundColor: getAvatarColor(profile?.name) }}>
              {(profile?.name || user?.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="section-label">Profile</span>
              <h3>{profile?.name}</h3>
              <p className="page-subtitle">{profile?.email}</p>
            </div>
          </div>

          <form className="form-card" onSubmit={saveProfile}>
            <label>
              Full Name
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input type="email" value={profile?.email || ''} readOnly />
            </label>
            <label>
              Phone
              <input
                type="text"
                value={profileForm.phone}
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              PAN Number
              <input
                type="text"
                value={profileForm.pan}
                onChange={(event) => setProfileForm((current) => ({ ...current, pan: event.target.value.toUpperCase() }))}
              />
            </label>
            <button className="button button-primary" type="submit">
              Save Changes
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Account Info</span>
              <h3>Membership and security</h3>
            </div>
          </div>

          <div className="comparison-row">
            <span>Member since</span>
            <strong>{new Date(profile?.createdAt).toLocaleDateString('en-IN')}</strong>
          </div>
          <div className="comparison-row">
            <span>Account type</span>
            <strong>
              <span className={`pill-badge ${profile?.role === 'admin' ? 'badge-buy' : 'badge-executed'}`}>
                {profile?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </strong>
          </div>
          <div className="comparison-row">
            <span>Total orders placed</span>
            <strong>{profile?.ordersCount || 0}</strong>
          </div>

          <form className="form-card password-card" onSubmit={changePassword}>
            <span className="section-label">Security</span>
            <label>
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirmNewPassword: event.target.value }))
                }
              />
            </label>
            <button className="button button-secondary" type="submit">
              Change Password
            </button>
          </form>

          <div className="logout-box">
            <span className="section-label">Session</span>
            <p className="page-subtitle">Sign out from this dashboard session when you are done.</p>
            <button className="button button-danger" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Profile;
