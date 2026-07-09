import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScanFace, ArrowRight, PlayCircle } from 'lucide-react';
import ResolvingGrid from '../../components/ResolvingGrid';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-glow" />
      <div className="container hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-eyebrow eyebrow">
            <ScanFace size={16} /> AI Face Recognition for Events
          </div>

          <h1>
            Find your event photos<br />in <em>one selfie.</em>
          </h1>

          <p className="hero-sub">
            Upload thousands of event photos. Guests scan a QR code, take one selfie,
            and our AI instantly surfaces only the photos that have their face in
            them — never anyone else's.
          </p>

          <div className="hero-cta-row">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              <PlayCircle size={18} /> Live Demo
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">2,400+</div>
              <div className="hero-stat-label">Events Completed</div>
            </div>
            <div>
              <div className="hero-stat-num">1.8M</div>
              <div className="hero-stat-label">Photos Processed</div>
            </div>
            <div>
              <div className="hero-stat-num">94K</div>
              <div className="hero-stat-label">Happy Guests</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <ResolvingGrid />
        </motion.div>
      </div>
    </section>
  );
}
