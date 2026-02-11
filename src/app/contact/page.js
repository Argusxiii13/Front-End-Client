import Header from '../components/Header';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <main className='max-w-[1920px] bg-white mx-auto relative'>
      <Header />
      <div className="pt-16">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
