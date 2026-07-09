import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const PLANS = [
  {
    tier: 'Starter',
    price: '₹2,999',
    period: '/event',
    desc: 'For small gatherings and intimate celebrations.',
    features: ['Up to 500 photos', 'Up to 100 guests', 'AI face matching', '30-day photo access', 'Email support'],
  },
  {
    tier: 'Professional',
    price: '₹7,999',
    period: '/event',
    desc: 'Built for weddings, conferences, and large parties.',
    features: ['Up to 5,000 photos', 'Unlimited guests', 'Priority AI processing', '1-year photo access', 'Custom QR branding', 'Priority support'],
    featured: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For photographers and agencies running multiple events.',
    features: ['Unlimited photos', 'Unlimited events', 'White-label branding', 'API access', 'Dedicated account manager'],
  },
];

export default function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">Pricing</span>
          <h2>One price per event. No hidden fees.</h2>
        </div>

        <div className="pricing-grid">
          {PLANS.map((p) => (
            <div key={p.tier} className={`card pricing-card ${p.featured ? 'featured' : ''}`}>
              {p.featured && <span className="pricing-badge">Most Popular</span>}
              <div className="pricing-tier">{p.tier}</div>
              <div className="pricing-amount">{p.price} <span>{p.period}</span></div>
              <p className="pricing-desc">{p.desc}</p>
              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f}><Check size={16} /> {f}</li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`btn btn-block ${p.featured ? 'btn-primary' : 'btn-secondary'}`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
