import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = "text-sm font-medium hover:text-green-700 transition" ;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/">
        <Logo height={44} />
      </Link>

      <div className="flex items-center gap-5">
        {user?.role === 'admin' && (
          <>
            <Link to="/dashboard" className={linkClass} style={{ color: '#3a6b00' }}>Dashboard</Link>
            <Link to="/tasks" className={linkClass} style={{ color: '#3a6b00' }}>Tasks</Link>
            <Link to="/assignments" className={linkClass} style={{ color: '#3a6b00' }}>Assignments</Link>
          </>
        )}
        {user?.role === 'volunteer' && (
          <>
            <Link to="/volunteer/profile" className={linkClass} style={{ color: '#3a6b00' }}>My Profile</Link>
            <Link to="/tasks" className={linkClass} style={{ color: '#3a6b00' }}>Tasks</Link>
          </>
        )}
        {user?.role === 'beneficiary' && (
          <>
            <Link to="/beneficiary/profile" className={linkClass} style={{ color: '#3a6b00' }}>My Profile</Link>
            <Link to="/tasks" className={linkClass} style={{ color: '#3a6b00' }}>Tasks</Link>
          </>
        )}
        {user ? (
          <button onClick={handleLogout}
            className="text-sm font-semibold px-4 py-1.5 rounded transition"
            style={{ backgroundColor: '#3a6b00', color: 'white' }}>
            Logout
          </button>
        ) : (
          <Link to="/login"
            className="text-sm font-semibold px-4 py-1.5 rounded transition"
            style={{ backgroundColor: '#3a6b00', color: 'white' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
