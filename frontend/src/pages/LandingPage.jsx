import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from './landing/Hero';
import Features from './landing/Features';
import HowItWorks from './landing/HowItWorks';
import GalleryPreview from './landing/GalleryPreview';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import Faq from './landing/Faq';
import CtaSection from './landing/CtaSection';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <GalleryPreview />
      <Testimonials />
      <Pricing />
      <Faq />
      <CtaSection />
      <Footer />
    </>
  );
}
