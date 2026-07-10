import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const user = await login(formData.email, formData.password);
      const redirectTo = location.state?.from?.pathname;
     if (redirectTo) {
  navigate(redirectTo, { replace: true });
} else if (user.role === "admin") {
  navigate("/admin/dashboard", { replace: true });
} else {
  navigate("/", { replace: true });
}
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      visualTitle="Welcome back."
      visualSub="Log in to view your matched photos or manage your events."
    >
      <h1>Log in to your account</h1>
      <p className="auth-sub">Enter your credentials to continue.</p>

      <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-form-group">
          <label htmlFor="email">Email Address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          {errors.email && <span className="field-error-text">{errors.email.message}</span>}
        </div>

        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--signal)', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <Lock size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
              placeholder="Your password"
              {...register('password', { required: 'Password is required' })}
            />
            <button type="button" className="toggle-visibility" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="field-error-text">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

     <p className="auth-footer-text">
  Don't have an account?{" "}
  <Link
    to="/register"
    state={location.state}
  >
    Sign up
  </Link>
</p>
    </AuthLayout>
  );
}
