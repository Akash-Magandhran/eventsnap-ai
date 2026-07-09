import { useEffect, useState } from 'react';
import { Image, Users, ScanFace, TrendingUp } from 'lucide-react';
import { eventsApi } from '../../api/events';

export default function AnalyticsTab({ event }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    eventsApi.analytics(event.id).then(({ data }) => setData(data.data));
  }, [event.id]);

  if (!data) return <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />;

  const cards = [
    { icon: Image, label: 'Processing Progress', value: `${data.processing_progress}%` },
    { icon: Users, label: 'Attendees Joined', value: data.total_attendees },
    { icon: ScanFace, label: 'Selfies Captured', value: data.selfies_captured },
    { icon: TrendingUp, label: 'Avg Matches / Attendee', value: data.avg_matches_per_attendee },
  ];

  return (
    <div className="admin-stats-grid">
      {cards.map((c) => (
        <div key={c.label} className="card admin-stat-card">
          <div className="admin-stat-icon"><c.icon size={20} /></div>
          <div className="admin-stat-value">{c.value}</div>
          <div className="admin-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
