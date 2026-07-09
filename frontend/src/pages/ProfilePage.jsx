import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../components/layout/Navbar';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const onSubmit = async (formData) => {
    setServerError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const { data } = await authApi.updateProfile(formData);
      setUser(data.data);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="container profile-page">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>{user.name}</h1>
            <p>{user.email}</p>
            <span className="profile-role-badge">{user.role === 'admin' ? 'Organizer' : 'Attendee'}</span>
          </div>
        </div>

        <div className="card profile-card">
          <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>

          <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>
          <Alert type="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="field-error-text">{errors.name.message}</span>}
            </div>

            <div className="auth-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" className="input-field" placeholder="Optional" {...register('phone')} />
            </div>

            <div className="auth-form-group">
              <label>Email Address</label>
              <input className="input-field" value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
