import { motion } from 'framer-motion';
import { ScanFace, Zap, QrCode, Lock, ShieldCheck, Download } from 'lucide-react';
import './Features.css';

const FEATURES = [
  {
    icon: ScanFace,
    title: 'AI Face Recognition',
    desc: 'Industry-grade face detection and embedding matching finds every appearance of your face with high accuracy, even in group shots.',
  },
  {
    icon: Zap,
    title: 'Fast Search',
    desc: 'Results return in seconds, not minutes. Our pipeline pre-processes every photo the moment it is uploaded.',
  },
  {
    icon: QrCode,
    title: 'QR Access',
    desc: 'No app to install. Guests scan one code, register, and they are in — works on every phone camera.',
  },
  {
    icon: Lock,
    title: 'Private Gallery',
    desc: 'Each guest only ever sees photos containing their own face. Strangers never see your photos, and you never see theirs.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Login',
    desc: 'JWT-based authentication, hashed passwords, and protected APIs keep every account and photo locked down.',
  },
  {
    icon: Download,
    title: 'Download Photos',
    desc: 'Save individual shots or your entire matched gallery in one tap — full resolution, no watermarks.',
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">What's Inside</span>
          <h2>Everything an event needs to return every photo to its rightful owner</h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <div className="feature-icon"><f.icon size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
