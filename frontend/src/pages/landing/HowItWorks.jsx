import { motion } from 'framer-motion';
import { QrCode, UserPlus, Camera, ScanFace, Images } from 'lucide-react';
import './HowItWorks.css';

const STEPS = [
  { icon: QrCode, title: 'Scan QR', desc: 'Find the event QR code posted at the venue or shared by the organizer.' },
  { icon: UserPlus, title: 'Register / Login', desc: 'Create an account in seconds — just your name, email, and a password.' },
  { icon: Camera, title: 'Capture Selfie', desc: 'Take one clear selfie. That\u2019s the only photo of yourself you\u2019ll ever need to upload.' },
  { icon: ScanFace, title: 'AI Searches', desc: 'Our engine compares your face against every photo from the event in seconds.' },
  { icon: Images, title: 'View Photos', desc: 'Browse, zoom, and download every photo that has you in it — and only those.' },
];

export default function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">The Process</span>
          <h2>From QR scan to your photos in under a minute</h2>
        </div>

        <div className="how-steps">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="how-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="how-step-num">STEP {String(i + 1).padStart(2, '0')}</span>
              <div className="how-step-icon"><s.icon size={26} /></div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="how-connector" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
