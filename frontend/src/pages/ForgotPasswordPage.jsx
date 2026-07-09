import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // request -> reset -> done
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const requestForm = useForm();
  const resetForm = useForm();

  const onRequestSubmit = async ({ email }) => {
    setServerError('');
    setSubmitting(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setServerMessage(data.message);
      // In dev mode the backend returns the token directly so the flow is testable
      // without an SMTP server. In production this would only be emailed.
      if (data.data?.reset_token) {
        setResetToken(data.data.reset_token);
        resetForm.setValue('token', data.data.reset_token);
      }
      setStep('reset');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const onResetSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(formData);
      setStep('done');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      visualTitle="Forgot something?"
      visualSub="It happens. Let's get you a new password and back to your photos."
    >
      {step === 'request' && (
        <>
          <h1>Reset your password</h1>
          <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
          <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} noValidate>
            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  className={`input-field ${requestForm.formState.errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  {...requestForm.register('email', { required: 'Email is required' })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      )}

      {step === 'reset' && (
        <>
          <h1>Set a new password</h1>
          <p className="auth-sub">{serverMessage}</p>
          {resetToken && (
            <Alert type="info">Dev mode: your reset token has been pre-filled below.</Alert>
          )}
          <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} noValidate>
            <div className="auth-form-group">
              <label htmlFor="token">Reset Token</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} />
                <input
                  id="token"
                  className="input-field"
                  placeholder="Paste your reset token"
                  {...resetForm.register('token', { required: true })}
                />
              </div>
            </div>
            <div className="auth-form-group">
              <label htmlFor="new_password">New Password</label>
              <div className="auth-input-wrap">
                <Lock size={18} />
                <input
                  id="new_password"
                  type="password"
                  className="input-field"
                  placeholder="At least 8 characters"
                  {...resetForm.register('new_password', { required: true, minLength: 8 })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}

      {step === 'done' && (
        <>
          <h1>Password reset!</h1>
          <p className="auth-sub">Redirecting you to login...</p>
        </>
      )}

      <p className="auth-footer-text">
        Remembered it? <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
