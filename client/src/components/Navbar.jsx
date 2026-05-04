import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const REMARLogo = () => (
  <Link to="/" className="flex items-center gap-2">
    <div style={{ background: 'white', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
        <path d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4z" fill="#579500"/>
        <path d="M14 14h4l4 6 4-6h4l-6 9v7h-4v-7L14 14z" fill="white"/>
      </svg>
    </div>
    <div className="leading-tight">
      <span className="text-white font-bold text-lg tracking-wide">REMAR</span>
      <span className="text-green-200 text-sm ml-1 font-light">Schweiz</span>
    </div>
  </Link>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ backgroundColor: '#579500' }} className="text-white px-6 py-3 flex items-center justify-between shadow-md">
      <REMARLogo />
      <div className="flex items-center gap-5 text-sm font-medium">
        {user?.role === 'admin' && (
          <>
            <Link to="/dashboard" className="hover:text-green-200 transition">Dashboard</Link>
            <Link to="/tasks" className="hover:text-green-200 transition">Tasks</Link>
            <Link to="/assignments" className="hover:text-green-200 transition">Assignments</Link>
          </>
        )}
        {user?.role === 'volunteer' && (
          <>
            <Link to="/volunteer/profile" className="hover:text-green-200 transition">My Profile</Link>
            <Link to="/tasks" className="hover:text-green-200 transition">Tasks</Link>
          </>
        )}
        {user?.role === 'beneficiary' && (
          <>
            <Link to="/beneficiary/profile" className="hover:text-green-200 transition">My Profile</Link>
            <Link to="/tasks" className="hover:text-green-200 transition">Tasks</Link>
          </>
        )}
        {user ? (
          <button onClick={handleLogout}
            className="bg-white font-semibold px-4 py-1.5 rounded transition hover:bg-green-100"
            style={{ color: '#579500' }}>
            Logout
          </button>
        ) : (
          <Link to="/login"
            className="bg-white font-semibold px-4 py-1.5 rounded transition hover:bg-green-100"
            style={{ color: '#579500' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
