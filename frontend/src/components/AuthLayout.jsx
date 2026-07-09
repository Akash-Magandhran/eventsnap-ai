import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import ResolvingGrid from './ResolvingGrid';
import './AuthLayout.css';

export default function AuthLayout({ children, visualTitle, visualSub }) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-logo">
            <span className="mark"><Sparkles size={18} /></span>
            EventSnap AI
          </Link>
          <h2>{visualTitle}</h2>
          <p>{visualSub}</p>
          <div style={{ marginTop: 48 }}>
            <ResolvingGrid />
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <Link to="/" className="back-link">
            <ArrowLeft size={14} /> Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
