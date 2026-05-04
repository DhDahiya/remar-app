import { useEffect, useState } from 'react';
import api from '../api';
import Logo from '../components/Logo';

const PRESET_SKILLS = [
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

function CalendarPicker({ selected, onChange }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const toggleDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (selected.includes(dateStr)) {
      onChange(selected.filter(d => d !== dateStr));
    } else {
      onChange([...selected, dateStr]);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="text-gray-500 hover:text-green-700 px-2">‹</button>
        <span className="text-sm font-semibold text-gray-700">{monthName}</span>
        <button onClick={nextMonth} className="text-gray-500 hover:text-green-700 px-2">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {['Sun','Mo','T','W','Th','F','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center text-sm gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selected.includes(dateStr);
          return (
            <button key={i} onClick={() => toggleDate(day)}
              className={`w-8 h-8 mx-auto rounded-full text-sm transition ${
                isSelected ? 'bg-green-700 text-white font-semibold' : 'hover:bg-green-100 text-gray-700'
              }`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function VolunteerProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  useEffect(() => {
    api.get('/volunteers/me').then(res => {
      const v = res.data;
      setProfile(v);
      setName(v.name || '');
      setPhone(v.phone || '');
      setSkills(v.skills || []);
      setAvailableDates(v.availability?.dates || []);
    }).catch(() => {});
  }, []);

  const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

  const addSkill = (s) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setNewSkill('');
    setShowSkillInput(false);
    setShowSkillPicker(false);
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await api.put(`/volunteers/${profile.id}`, {
          ...profile,
          name,
          phone,
          skills,
          availability: { dates: availableDates }
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
      {/* Mobile-style container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <Logo size={38} />
          <span className="text-sm text-gray-400">Schweiz</span>
        </div>

        <div className="px-5 py-6 space-y-6 pb-32">

          {/* Profile Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Volunteer Profile</h2>
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

          {/* Skills Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">My Skills</h2>
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill} className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-gray-700 text-sm">{skill}</span>
                  <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500 ml-2 text-lg leading-none">×</button>
                </div>
              ))}

              {showSkillInput && (
                <input autoFocus value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
                  placeholder="Type a skill and press Enter"
                  className="w-full border border-green-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}

              {showSkillPicker && (
                <div className="border rounded-xl p-3 bg-gray-50 space-y-1">
                  {PRESET_SKILLS.filter(s => !skills.includes(s)).map(s => (
                    <button key={s} onClick={() => addSkill(s)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-green-100 rounded-lg text-gray-700">
                      {s}
                    </button>
                  ))}
                  <button onClick={() => { setShowSkillPicker(false); setShowSkillInput(true); }}
                    className="block w-full text-left px-3 py-2 text-sm text-green-700 font-medium hover:bg-green-100 rounded-lg">
                    + Custom skill...
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={() => { setShowSkillPicker(!showSkillPicker); setShowSkillInput(false); }}
                  className="bg-green-700 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition">
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Availability</h2>
            <p className="text-xs text-gray-400 mb-3">Tap dates you are available</p>
            <CalendarPicker selected={availableDates} onChange={setAvailableDates} />
            {availableDates.length > 0 && (
              <p className="text-xs text-green-700 mt-2">{availableDates.length} date(s) selected</p>
            )}
          </div>

        </div>

        {/* Save Button - fixed at bottom */}
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
