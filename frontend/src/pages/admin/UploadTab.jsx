import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import Alert from '../../components/Alert';
import { photosApi } from '../../api/photos';

export default function UploadTab({ event, onUploaded }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError('');
    setSuccessMsg('');

    try {
      const { data } = await photosApi.upload(event.id, files, setProgress);
      setSuccessMsg(data.message);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>

      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="spin" style={{ marginBottom: 12, color: 'var(--signal)' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Uploading and running AI face detection...</p>
            <div className="upload-progress-row" style={{ maxWidth: 320, margin: '16px auto 0' }}>
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progress}%</span>
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={32} style={{ marginBottom: 12, color: 'var(--signal)' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Drag & drop photos here, or click to browse
            </p>
            <p style={{ fontSize: '0.85rem' }}>Supports JPG, PNG. Upload in batches of up to 200 at a time.</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="admin-progress-bar" style={{ marginTop: 24 }}>
        <div className="admin-progress-fill" style={{ width: `${event.processing_progress || 0}%` }} />
      </div>
      <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
        {event.processed_photos} / {event.total_photos} photos processed ({event.processing_progress || 0}%)
      </p>
    </div>
  );
}
