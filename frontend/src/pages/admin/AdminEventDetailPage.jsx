import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { eventsApi } from '../../api/events';
import QrTab from './QrTab';
import UploadTab from './UploadTab';
import GalleryTab from './GalleryTab';
import AttendeesTab from './AttendeesTab';
import AnalyticsTab from './AnalyticsTab';
import './AdminLayout.css';
import './EventDetail.css';

const TABS = ['QR Code', 'Upload Photos', 'Gallery', 'Attendees', 'Analytics'];

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('QR Code');
  const [regenerating, setRegenerating] = useState(false);

  const loadEvent = () => {
    eventsApi.detail(id)
      .then(({ data }) => setEvent(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvent(); }, [id]);

  const handleRegenerateQr = async () => {
    setRegenerating(true);
    try {
      const { data } = await eventsApi.regenerateQr(id);
      setEvent(data.data);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm(`Delete "${event.name}"? This will permanently delete all photos and matches.`)) return;
    await eventsApi.delete(id);
    window.location.href = '/admin/events';
  };

  if (loading || !event) {
    return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>{event.name}</h1>
          <span className={`admin-event-status status-${event.status}`}>{event.status}</span>
        </div>
        <button className="btn btn-secondary" onClick={handleDeleteEvent} style={{ color: 'var(--danger)' }}>
          <Trash2 size={16} /> Delete Event
        </button>
      </div>

      <div className="event-detail-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`event-detail-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'QR Code' && <QrTab event={event} onRegenerate={handleRegenerateQr} regenerating={regenerating} />}
      {activeTab === 'Upload Photos' && <UploadTab event={event} onUploaded={loadEvent} />}
      {activeTab === 'Gallery' && <GalleryTab event={event} />}
      {activeTab === 'Attendees' && <AttendeesTab event={event} />}
      {activeTab === 'Analytics' && <AnalyticsTab event={event} />}
    </div>
  );
}
