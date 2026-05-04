import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const SUPPORT_NEEDS = ['Companionship', 'Meal Preparation', 'Transport', 'Medical Assistance', 'Home Help', 'Emotional Support', 'Technology Help', 'Shopping'];
const AGE_GROUPS = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Weekdays', 'Weekends', 'Flexible'];

export default function BeneficiaryRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [auth, setAuth] = useState({ email: '', password: '' });
  const [profile, setProfile] = useState({
    name: '', nickname: '', date_of_birth: '', age_group: '', gender: '',
    address: '', phone: '', support_needs: [], time_preferences: [], personality_notes: ''
  });

  const toggle = (field, value) => {
    setProfile(p => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter(v => v !== value) : [...p[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const authRes = await api.post('/auth/register', { ...auth, role: 'beneficiary' });
      const { user: userData, token } = authRes.data;
      login(userData, token);
      await api.post('/beneficiaries', {
        ...profile,
        time_preferences: { slots: profile.time_preferences }
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold remar-green mb-1">Beneficiary Registration</h1>
        <p className="text-gray-500 mb-6 text-sm">Register to receive support from REMAR volunteers</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b pb-4">
            <h2 className="font-semibold remar-green mb-3">Account Details</h2>
            <div className="grid grid-cols-1 gap-3">
              <input type="email" required placeholder="Email address" value={auth.email}
                onChange={e => setAuth({ ...auth, email: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
              <input type="password" required placeholder="Password (min 6 chars)" minLength={6} value={auth.password}
                onChange={e => setAuth({ ...auth, password: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="font-semibold remar-green mb-3">Personal Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Full name *" required value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
              <input placeholder="Nickname (optional)" value={profile.nickname}
                onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
              <input type="date" value={profile.date_of_birth}
                onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
              <select value={profile.age_group} onChange={e => setProfile({ ...profile, age_group: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar">
                <option value="">Age group</option>
                {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
              <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar">
                <option value="">Gender</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
              <input placeholder="Phone number" value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
            </div>
            <input placeholder="Address" value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              className="w-full mt-3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
          </div>

          <div className="border-b pb-4">
            <h2 className="font-semibold remar-green mb-3">Support Needs</h2>
            <div className="flex flex-wrap gap-2">
              {SUPPORT_NEEDS.map(need => (
                <button type="button" key={need} onClick={() => toggle('support_needs', need)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    profile.support_needs.includes(need)
                      ? 'bg-remar text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
                  }`}>
                  {need}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="font-semibold remar-green mb-3">Time Preferences</h2>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map(t => (
                <button type="button" key={t} onClick={() => toggle('time_preferences', t)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    profile.time_preferences.includes(t)
                      ? 'bg-yellow-400 text-green-900 border-yellow-400'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold remar-green mb-3">About You</h2>
            <textarea rows={3} placeholder="Share anything that helps us match you with the right volunteer..."
              value={profile.personality_notes}
              onChange={e => setProfile({ ...profile, personality_notes: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar resize-none" />
          </div>

          <button type="submit" className="w-full bg-remar text-white py-3 rounded-lg font-semibold hover:bg-remar transition text-lg">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}
