import { useState } from 'react';
import infolabIcon from '../../assets/infolab-icon.jpg';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── LOGIN ──────────────────────────────────────────────────

export function LoginPage() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(data) {
    setServerError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      const admin = result?.user?.role === 'admin' || result?.user?.role === 'super_admin';
      navigate(admin ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-section flex items-center justify-center min-h-[70vh]">
      <div className="container-sm w-full max-w-md">
          <div className="flex justify-center mb-4"><img src={infolabIcon} alt="INFOLAB" className="w-12 h-12" /></div>
        <div className="card p-8">
          <h1 className="section-title text-center text-2xl">Welcome Back</h1>
          <p className="text-center text-gray-500 mt-2 mb-6">Log in to continue learning.</p>

          {serverError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-brand-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-accent font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ───────────────────────────────────────────────

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register, handleSubmit, watch, formState: { errors },
  } = useForm();

  const password = watch('password');

  async function onSubmit(data) {
    setServerError('');
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/student/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-section flex items-center justify-center min-h-[70vh]">
      <div className="container-sm w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-center mb-4"><img src={infolabIcon} alt="INFOLAB" className="w-12 h-12" /></div>
          <h1 className="section-title text-center text-2xl">Create Your Account</h1>
          <p className="text-center text-gray-500 mt-2 mb-6">Start learning with INFOLAB LMS.</p>

          {serverError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your full name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-accent font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── FORGOT PASSWORD ────────────────────────────────────────

export function ForgotPasswordPage() {
  return (
    <div className="page-section flex items-center justify-center min-h-[70vh]">
      <div className="container-sm w-full max-w-md">
        <div className="card p-8 text-center">
          <h1 className="section-title text-2xl">Forgot Password</h1>
          <p className="text-gray-500 mt-2">Password reset is coming soon.</p>
          <Link to="/login" className="text-brand-accent hover:underline mt-4 inline-block">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  return (
    <div className="page-section flex items-center justify-center min-h-[70vh]">
      <div className="container-sm w-full max-w-md">
        <div className="card p-8 text-center">
          <h1 className="section-title text-2xl">Reset Password</h1>
          <p className="text-gray-500 mt-2">Password reset is coming soon.</p>
          <Link to="/login" className="text-brand-accent hover:underline mt-4 inline-block">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
