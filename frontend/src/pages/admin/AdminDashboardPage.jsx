import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Image, Users, ScanFace, PlusCircle, ArrowRight } from 'lucide-react';
import { eventsApi } from '../../api/events';
import './AdminLayout.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.dashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { icon: CalendarDays, value: stats.total_events, label: 'Total Events' },
    { icon: Image, value: stats.total_photos, label: 'Photos Uploaded' },
    { icon: Users, value: stats.total_attendees, label: 'Total Attendees' },
    { icon: ScanFace, value: stats.total_face_matches, label: 'Face Matches' },
  ] : [];

  return (
    <div>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <Link to="/admin/events/create" className="btn btn-primary">
          <PlusCircle size={18} /> Create Event
        </Link>
      </div>

      <div className="admin-stats-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
            ))
          : STAT_CARDS.map((s, i) => (
              <motion.div
                key={s.label}
                className="card admin-stat-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="admin-stat-icon"><s.icon size={20} /></div>
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </motion.div>
            ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem' }}>Recent Events</h2>
        <Link to="/admin/events" style={{ fontSize: '0.88rem', color: 'var(--signal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {!loading && stats?.recent_events?.length === 0 && (
        <div className="admin-empty-state">
          <h3>No events yet</h3>
          <p style={{ margin: '8px 0 20px' }}>Create your first event to start uploading photos and generating QR codes.</p>
          <Link to="/admin/events/create" className="btn btn-primary"><PlusCircle size={18} /> Create Event</Link>
        </div>
      )}

      <div className="admin-events-grid">
        {!loading && stats?.recent_events?.map((e) => (
          <Link to={`/admin/events/${e.id}`} key={e.id} className="card admin-event-card">
            <div className="admin-event-body">
              <span className={`admin-event-status status-${e.status}`}>{e.status}</span>
              <h3 className="admin-event-title">{e.name}</h3>
              <p style={{ fontSize: '0.85rem' }}>{e.processed_photos} / {e.total_photos} photos processed</p>
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${e.total_photos ? (e.processed_photos / e.total_photos) * 100 : 0}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
