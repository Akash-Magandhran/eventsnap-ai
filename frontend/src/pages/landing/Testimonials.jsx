import './Testimonials.css';

const TESTIMONIALS = [
  {
    quote: 'We had 1,200 guests at our wedding. Within a day, everyone had their own photos without us lifting a finger.',
    name: 'Ananya & Rohit',
    role: 'Wedding Couple',
    seed: 'person1',
  },
  {
    quote: 'As a photographer, this cut my photo-delivery workload by 90%. Clients find their own shots instantly.',
    name: 'Marcus Webb',
    role: 'Event Photographer',
    seed: 'person2',
  },
  {
    quote: 'Our annual conference used to flood one shared folder. Now every attendee just gets their own photos.',
    name: 'Priya Nair',
    role: 'Conference Organizer',
    seed: 'person3',
  },
];

export default function Testimonials() {
  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">Loved By Organizers</span>
          <h2>People who stopped scrolling through shared folders</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="card testimonial-card" key={t.name}>
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author">
                <img className="testimonial-avatar" src={`https://i.pravatar.cc/80?u=${t.seed}`} alt="" />
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
