import { Sparkles, Mail, Globe, MessageCircle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="mark"><Sparkles size={16} /></span>
              EventSnap AI
            </div>
            <p className="footer-tagline">
              Find your event photos instantly using AI face recognition. One selfie, thousands of photos, only yours.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <Globe size={18} />
              <MessageCircle size={18} />
              <Mail size={18} />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} EventSnap AI. All rights reserved.</span>
          <span>Built with AI face recognition technology.</span>
        </div>
      </div>
    </footer>
  );
}
