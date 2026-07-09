import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--signal-dim)', color: 'var(--signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Frown size={32} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Page not found</h1>
        <p style={{ marginBottom: 28 }}>The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
