import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('attendee');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const user = await registerUser({ ...formData, role });

const redirectTo = location.state?.from?.pathname;

if (redirectTo) {
  navigate(redirectTo, { replace: true });
} else if (user.role === 'admin') {
  navigate('/admin/dashboard', { replace: true });
} else {
  navigate('/', { replace: true });
}
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      visualTitle="Your photos, found instantly."
      visualSub="Join thousands of guests and organizers using AI to put every photo in the right hands."
    >
      <h1>Create your account</h1>
      <p className="auth-sub">Get started with EventSnap AI in under a minute.</p>

      <div className="auth-role-toggle">
        <button type="button" className={role === 'attendee' ? 'active' : ''} onClick={() => setRole('attendee')}>
          I'm a Guest
        </button>
        <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
          I'm an Organizer
        </button>
      </div>

      <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-form-group">
          <label htmlFor="name">Full Name</label>
          <div className="auth-input-wrap">
            <User size={18} />
            <input
              id="name"
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Jane Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
            />
          </div>
          {errors.name && <span className="field-error-text">{errors.name.message}</span>}
        </div>

        <div className="auth-form-group">
          <label htmlFor="email">Email Address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />
          </div>
          {errors.email && <span className="field-error-text">{errors.email.message}</span>}
        </div>

        <div className="auth-form-group">
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <Lock size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 8 characters"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Must be at least 8 characters' } })}
            />
            <button type="button" className="toggle-visibility" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="field-error-text">{errors.password.message}</span>}
        </div>

        <div className="auth-form-group">
          <label htmlFor="confirm_password">Confirm Password</label>
          <div className="auth-input-wrap">
            <Lock size={18} />
            <input
              id="confirm_password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${errors.confirm_password ? 'input-error' : ''}`}
              placeholder="Re-enter your password"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
          </div>
          {errors.confirm_password && <span className="field-error-text">{errors.confirm_password.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
