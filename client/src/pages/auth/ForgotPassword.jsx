import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Boxes, ArrowRight, Mail, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setGeneratedOtp(res.data.otp);
        // Automatically give option to jump to reset page with prefilled email
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${res.data.otp || ''}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not request password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-odoo-600 text-white shadow-lg mb-3">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">OTP-based secure password recovery</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/80">
          <p className="text-xs text-slate-600 mb-6">
            Enter your registered email address and we'll send a 6-digit OTP code to reset your account credentials.
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>OTP Code Generated!</span>
              </div>
              <p>{message}</p>
              {generatedOtp && (
                <div className="mt-2 p-2 bg-white rounded border border-emerald-300 font-mono text-center text-sm font-bold text-emerald-700">
                  OTP: {generatedOtp}
                </div>
              )}
              <p className="text-[11px] text-emerald-600">Redirecting to verification screen in 2 seconds...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@stocksense.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-odoo-600 hover:bg-odoo-700 text-white font-medium text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Generating OTP...' : 'Send Recovery OTP'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Remember your credentials?{' '}
            <Link to="/login" className="font-semibold text-odoo-600 hover:text-odoo-700">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
