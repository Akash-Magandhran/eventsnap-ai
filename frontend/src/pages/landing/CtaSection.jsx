import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CtaSection.css';

export default function CtaSection() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          <h2>Ready to give every guest their own photos?</h2>
          <p>Set up your first event in minutes. No credit card required to get started.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Your Event <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
