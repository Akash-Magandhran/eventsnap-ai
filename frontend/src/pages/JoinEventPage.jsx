import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { eventsApi } from '../api/events';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function JoinEventPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    eventsApi.publicLookup(slug)
      .then(({ data }) => setEvent(data.data))
      .catch(() => setError('This event could not be found. Please check your QR code or link.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleContinue = async () => {
    if (!user) {
      navigate('/register', { state: { from: { pathname: `/join/${slug}` } } });
      return;
    }
    setJoining(true);
    try {
      await eventsApi.joinConfirm(slug);
      navigate(`/face-scan/${event.public_id}`, { state: { eventId: event.public_id, slug } });
    } catch {
      setError('Could not join this event. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 320, height: 200, borderRadius: 24 }} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <Alert type="error">{error}</Alert>
          <Link to="/" className="btn btn-secondary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 460, width: '100%', padding: 40, textAlign: 'center' }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--signal-dim)', color: 'var(--signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Sparkles size={26} />
        </div>

        {event.cover_image && (
          <img src={event.cover_image} alt={event.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }} />
        )}

        <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>{event.name}</h1>
        {event.description && <p style={{ marginBottom: 16 }}>{event.description}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          {event.event_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Calendar size={15} /> {new Date(event.event_date).toLocaleDateString()}
            </span>
          )}
          {event.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <MapPin size={15} /> {event.location}
            </span>
          )}
        </div>

        <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>
          {user ? "You're logged in. Continue to capture your selfie and find your photos." : 'Create an account or log in to find your photos from this event.'}
        </p>

        <button className="btn btn-primary btn-block btn-lg" onClick={handleContinue} disabled={joining}>
          {joining ? 'Joining...' : (user ? 'Continue to Selfie' : 'Get Started')} <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
