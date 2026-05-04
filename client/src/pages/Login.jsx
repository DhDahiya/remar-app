import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Logo from '../components/Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/dashboard');
      else if (role === 'volunteer') navigate('/volunteer/profile');
      else navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f9f0' }}>
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center px-12"
        style={{ background: '#f7f9f4' }}>
        <div className="max-w-sm text-center">
          <div className="flex justify-center mb-6">
            <Logo size={90} />
          </div>
          <p className="text-gray-500 text-sm mt-2">Schweiz</p>
          <p className="text-gray-600 text-lg mt-6 leading-relaxed">
            Connecting volunteers with people who need support across Switzerland.
          </p>
          <p className="text-gray-400 text-sm mt-6 italic">
            "Every contribution counts."
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <Logo size={60} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#3a6b00' }}
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="••••••••" />
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: '#3a6b00' }}>
                  Forgot password?
                </Link>
              </div>
              <button type="submit"
                className="w-full text-white py-3 rounded-lg font-semibold text-sm transition hover:opacity-90"
                style={{ backgroundColor: '#3a6b00' }}>
                Sign In
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-sm text-center text-gray-500">
              <p>New volunteer?{' '}
                <Link to="/register/volunteer" className="font-semibold hover:underline" style={{ color: '#3a6b00' }}>
                  Register here
                </Link>
              </p>
              <p>New beneficiary?{' '}
                <Link to="/register/beneficiary" className="font-semibold hover:underline" style={{ color: '#3a6b00' }}>
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
