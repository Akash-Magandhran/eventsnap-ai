import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Download, X, ChevronLeft, ChevronRight, DownloadCloud } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { photosApi } from '../api/photos';
import './MyPhotosPage.css';

export default function MyPhotosPage() {
  const { eventId } = useParams();
  const [matches, setMatches] = useState([]);
  const [hasSelfie, setHasSelfie] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    photosApi.myPhotos(eventId)
      .then(({ data }) => {
        setMatches(data.data.matches);
        setHasSelfie(data.data.has_selfie);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const downloadImage = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const downloadAll = () => {
    matches.forEach((m, i) => downloadImage(m.image, `eventsnap-photo-${i + 1}.jpg`));
  };

  return (
    <div>
      <Navbar />
      <div className="container myphotos-page">
        <div className="myphotos-header">
          <div>
            <h1>My Photos</h1>
            <p>{matches.length} photo{matches.length === 1 ? '' : 's'} matched to your face</p>
          </div>
          {matches.length > 0 && (
            <button className="btn btn-primary" onClick={downloadAll}>
              <DownloadCloud size={18} /> Download All
            </button>
          )}
        </div>

        {loading && (
          <div className="myphotos-masonry">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200 + (i % 3) * 60, marginBottom: 16, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {!loading && !hasSelfie && (
          <div className="myphotos-empty">
            <div className="myphotos-empty-icon"><ImageOff size={32} /></div>
            <h3>No selfie captured yet</h3>
            <p style={{ marginTop: 8, marginBottom: 24 }}>Scan the event QR code and capture a selfie to find your photos.</p>
            <Link to="/" className="btn btn-secondary">Go Home</Link>
          </div>
        )}

        {!loading && hasSelfie && matches.length === 0 && (
          <div className="myphotos-empty">
            <div className="myphotos-empty-icon"><ImageOff size={32} /></div>
            <h3>No matches found yet</h3>
            <p style={{ marginTop: 8 }}>We couldn't find your face in any uploaded photos. Check back once more photos are processed, or contact the event organizer.</p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="myphotos-masonry">
            {matches.map((m, i) => (
              <motion.div
                key={m.photo_id}
                className="myphoto-item"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.6) }}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={m.thumbnail || m.image} alt="Matched event photo" loading="lazy" />
                <span className="myphoto-similarity-badge">{Math.round(m.similarity * 100)}% match</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && matches[lightboxIndex] && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close">
              <X size={20} />
            </button>

            {lightboxIndex > 0 && (
              <button
                className="lightbox-nav prev"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i - 1); }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {lightboxIndex < matches.length - 1 && (
              <button
                className="lightbox-nav next"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i + 1); }}
                aria-label="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            )}

            <img
              src={matches[lightboxIndex].image}
              alt="Matched event photo"
              className="lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="btn btn-primary lightbox-download"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(matches[lightboxIndex].image, `eventsnap-photo-${lightboxIndex + 1}.jpg`);
              }}
            >
              <Download size={16} /> Download
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
