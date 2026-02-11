import Header from '../components/Header';
import BrowseCars from '../components/BrowseCars';
import Footer from '../components/Footer';

export default function Browsing() {
    return (
      <main className='max-w-[1920px] bg-white mx-auto relative'>
        <Header />
        <div className="pt-16">
          <BrowseCars />
        </div>
        <Footer />
      </main>
    );
  }