import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="mark"><Sparkles size={18} /></span>
          EventSnap AI
        </Link>

        <div className="navbar-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/my-photos'} className="btn btn-secondary">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout} aria-label="Log out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}
