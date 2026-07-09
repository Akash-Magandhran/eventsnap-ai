import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const COLORS = {
  error: { bg: 'rgba(255, 92, 92, 0.1)', border: 'rgba(255, 92, 92, 0.3)', text: '#FF5C5C' },
  success: { bg: 'rgba(46, 204, 113, 0.1)', border: 'rgba(46, 204, 113, 0.3)', text: '#2ECC71' },
  info: { bg: 'rgba(255, 77, 46, 0.1)', border: 'rgba(255, 77, 46, 0.3)', text: '#FF4D2E' },
};

export default function Alert({ type = 'info', children, onClose }) {
  if (!children) return null;
  const Icon = ICONS[type];
  const c = COLORS[type];

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 12,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '0.9rem',
        marginBottom: 16,
      }}
    >
      <Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', color: c.text, padding: 0, display: 'flex' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
