import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { eventsApi } from '../../api/events';
import './AdminLayout.css';

export default function AdminEventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list()
      .then(({ data }) => setEvents(data.data?.results || data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-topbar">
        <h1>Events</h1>
        <Link to="/admin/events/create" className="btn btn-primary">
          <PlusCircle size={18} /> Create Event
        </Link>
      </div>

      {loading && (
        <div className="admin-events-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="admin-empty-state">
          <h3>No events yet</h3>
          <p style={{ margin: '8px 0 20px' }}>Create your first event to get started.</p>
          <Link to="/admin/events/create" className="btn btn-primary"><PlusCircle size={18} /> Create Event</Link>
        </div>
      )}

      <div className="admin-events-grid">
        {!loading && events.map((e) => (
          <Link to={`/admin/events/${e.id}`} key={e.id} className="card admin-event-card">
            {e.cover_image && <img src={e.cover_image} alt={e.name} className="admin-event-cover" />}
            <div className="admin-event-body">
              <span className={`admin-event-status status-${e.status}`}>{e.status}</span>
              <h3 className="admin-event-title">{e.name}</h3>
              <p style={{ fontSize: '0.85rem' }}>{e.processed_photos} / {e.total_photos} photos processed</p>
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${e.processing_progress || 0}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
