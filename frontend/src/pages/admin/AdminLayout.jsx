import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Sparkles, LayoutDashboard, CalendarDays, PlusCircle, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/events/create', label: 'Create Event', icon: PlusCircle },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin/dashboard" className="admin-logo">
          <span className="mark"><Sparkles size={16} /></span>
          EventSnap AI
        </Link>

        <nav>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-link ${location.pathname === item.to ? 'active' : ''}`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button className="theme-toggle" style={{ width: 32, height: 32 }} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <button className="admin-nav-link" style={{ width: '100%', background: 'none', border: 'none' }} onClick={handleLogout}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
