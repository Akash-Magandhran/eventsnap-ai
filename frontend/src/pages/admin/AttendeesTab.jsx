import { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { eventsApi } from '../../api/events';

export default function AttendeesTab({ event }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.attendees(event.id)
      .then(({ data }) => setAttendees(data.data || []))
      .finally(() => setLoading(false));
  }, [event.id]);

  if (loading) return <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />;

  if (attendees.length === 0) {
    return (
      <div className="admin-empty-state">
        <h3>No attendees yet</h3>
        <p style={{ marginTop: 8 }}>Share your QR code to start getting attendees.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="attendees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Selfie Status</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((a) => (
            <tr key={a.id}>
              <td>{a.user_name}</td>
              <td>{a.user_email}</td>
              <td>{new Date(a.joined_at).toLocaleDateString()}</td>
              <td>
                <span className={`selfie-pill ${a.has_selfie ? 'yes' : 'no'}`}>
                  {a.has_selfie ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  {a.has_selfie ? 'Captured' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
