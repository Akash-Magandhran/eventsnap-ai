import { Sun, Moon, User as UserIcon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar />
      <div className="container profile-page">
        <h1 style={{ fontSize: '1.8rem', marginBottom: 32 }}>Settings</h1>

        <div className="card profile-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 4 }}>Appearance</h3>
          <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Choose how EventSnap AI looks on your device.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => theme !== 'light' && toggleTheme()}>
              <Sun size={16} /> Light
            </button>
            <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => theme !== 'dark' && toggleTheme()}>
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>

        <div className="card profile-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 4 }}>Account</h3>
          <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Manage your profile information.</p>
          <Link to="/profile" className="btn btn-secondary">
            <UserIcon size={16} /> Edit Profile
          </Link>
        </div>

        <div className="card profile-card">
          <h3 style={{ marginBottom: 4 }}>Session</h3>
          <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Sign out of your account on this device.</p>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
