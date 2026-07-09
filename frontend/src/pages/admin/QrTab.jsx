import { Download, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QrTab({ event, onRegenerate, regenerating }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(event.join_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card qr-display-card">
      {event.qr_code_image && <img src={event.qr_code_image} alt="Event QR code" className="qr-display-img" />}
      <div style={{ flex: 1, minWidth: 240 }}>
        <h3 style={{ marginBottom: 8 }}>Share this QR code</h3>
        <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>
          Print this QR code and display it at your event. Guests scan it to register and find their photos.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input className="input-field" readOnly value={event.join_url} style={{ fontSize: '0.82rem' }} />
          <button className="btn btn-secondary" onClick={handleCopy} style={{ flexShrink: 0 }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a href={event.qr_code_image} download className="btn btn-primary">
            <Download size={16} /> Download QR
          </a>
          <button className="btn btn-secondary" onClick={onRegenerate} disabled={regenerating}>
            <RefreshCw size={16} className={regenerating ? 'spin' : ''} /> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
