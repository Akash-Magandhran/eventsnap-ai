import { useEffect, useState } from 'react';
import { Trash2, ScanFace } from 'lucide-react';
import { photosApi } from '../../api/photos';

export default function GalleryTab({ event }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = () => {
    setLoading(true);
    photosApi.listForEvent(event.id)
      .then(({ data }) => setPhotos(data.data?.results || data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPhotos(); }, [event.id]);

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    await photosApi.delete(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  if (loading) {
    return (
      <div className="admin-photo-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: 1, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="admin-empty-state">
        <h3>No photos uploaded yet</h3>
        <p style={{ marginTop: 8 }}>Switch to the Upload tab to add event photos.</p>
      </div>
    );
  }

  return (
    <div className="admin-photo-grid">
      {photos.map((p) => (
        <div className="admin-photo-item" key={p.id}>
          <img src={p.thumbnail || p.image} alt="" loading="lazy" />
          <div className="admin-photo-overlay">
            <span className="admin-photo-faces-badge">
              <ScanFace size={11} style={{ display: 'inline', marginRight: 4 }} />
              {p.faces_detected}
            </span>
            <button className="admin-photo-delete" onClick={() => handleDelete(p.id)} aria-label="Delete photo">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
