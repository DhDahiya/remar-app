import { useEffect, useState } from 'react';
import api from '../api';
import Logo from '../components/Logo';

const PRESET_NEEDS = [
  'Food Delivery / Transport',
  'Clothing Donation / Sorting',
  'Companionship',
  'Medical Assistance',
  'Home Help',
  'Emotional Support',
  'Tech Support',
  'Gardening',
  'Cooking',
  'Administrative',
];

export default function BeneficiaryProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [needs, setNeeds] = useState([]);
  const [newNeed, setNewNeed] = useState('');
  const [showNeedInput, setShowNeedInput] = useState(false);
  const [showNeedPicker, setShowNeedPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/beneficiaries/me').then(res => {
      const b = res.data;
      setProfile(b);
      setName(b.name || '');
      setPhone(b.phone || '');
      setNeeds(b.support_needs || []);
    }).catch(() => {});
  }, []);

  const removeNeed = (n) => setNeeds(needs.filter(x => x !== n));

  const addNeed = (n) => {
    const trimmed = n.trim();
    if (trimmed && !needs.includes(trimmed)) setNeeds([...needs, trimmed]);
    setNewNeed('');
    setShowNeedInput(false);
    setShowNeedPicker(false);
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await api.put(`/beneficiaries/${profile.id}`, {
          ...profile,
          name,
          phone,
          support_needs: needs,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <Logo size={38} />
          <span className="text-sm text-gray-400">Schweiz</span>
        </div>

        <div className="px-5 py-6 space-y-6 pb-32">

          {/* Profile Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          {/* Support Needs Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">My Support Needs</h2>
            <div className="space-y-2">
              {needs.map(need => (
                <div key={need} className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-gray-700 text-sm">{need}</span>
                  <button onClick={() => removeNeed(need)} className="text-gray-400 hover:text-red-500 ml-2 text-lg leading-none">×</button>
                </div>
              ))}

              {showNeedInput && (
                <input autoFocus value={newNeed} onChange={e => setNewNeed(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNeed(newNeed)}
                  placeholder="Type a need and press Enter"
                  className="w-full border border-green-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}

              {showNeedPicker && (
                <div className="border rounded-xl p-3 bg-gray-50 space-y-1">
                  {PRESET_NEEDS.filter(n => !needs.includes(n)).map(n => (
                    <button key={n} onClick={() => addNeed(n)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-green-100 rounded-lg text-gray-700">
                      {n}
                    </button>
                  ))}
                  <button onClick={() => { setShowNeedPicker(false); setShowNeedInput(true); }}
                    className="block w-full text-left px-3 py-2 text-sm text-green-700 font-medium hover:bg-green-100 rounded-lg">
                    + Custom need...
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={() => { setShowNeedPicker(!showNeedPicker); setShowNeedInput(false); }}
                  className="bg-green-700 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition">
                  Add Need
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-6 bg-white pt-3">
          <button onClick={handleSave}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-600 transition">
            {saved ? '✓ Profile Saved!' : 'Save Profile'}
          </button>
        </div>

      </div>
    </div>
  );
}
