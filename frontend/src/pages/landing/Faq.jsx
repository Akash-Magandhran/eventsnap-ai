import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import './Faq.css';

const FAQS = [
  {
    q: 'How accurate is the face recognition?',
    a: 'Our AI uses state-of-the-art face embedding models that achieve very high accuracy even with varied lighting, angles, and partial occlusions like sunglasses or hats. You can fine-tune the match sensitivity per event.',
  },
  {
    q: 'Can other guests see my photos?',
    a: 'No. Every guest only ever sees photos where our AI has matched their own face. There is no shared gallery — your private match list is generated specifically for you and is never visible to anyone else.',
  },
  {
    q: 'What if I am not detected in any photo?',
    a: 'If your selfie does not match any uploaded photos, you will see a clear empty state. You can retake your selfie with better lighting, or contact the event organizer if you believe you should appear in some photos.',
  },
  {
    q: 'How long does processing take for 1,000 photos?',
    a: 'Processing time depends on server hardware, but our pipeline detects and embeds faces as photos are uploaded, so most events are fully searchable within minutes of the last upload.',
  },
  {
    q: 'Do guests need to install an app?',
    a: 'No. EventSnap AI runs entirely in the browser. Guests scan the QR code, and everything — registration, selfie capture, and browsing — happens on the web.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">Questions</span>
          <h2>Frequently asked questions</h2>
        </div>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div className="faq-item" key={item.q}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }}>
                    <Plus size={20} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
