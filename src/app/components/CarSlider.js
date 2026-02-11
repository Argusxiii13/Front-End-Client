'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn } from '/variants';
import { X } from 'lucide-react';
import Link from 'next/link';

const Modal = ({ car, rating, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <motion.div
            variants={modalVariants}
            className="bg-white rounded-lg max-w-[90%] w-full max-h-[90vh] overflow-y-auto md:max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{car.brand} {car.model}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2">
                  <Image
                    src={`data:image/svg+xml;base64,${car.image}`}
                    width={480}
                    height={360}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <div className="text-sm text-gray-500 uppercase mb-2">
                    Type: {car.type}
                  </div>
                  <div className="text-2xl uppercase font-bold mb-4">
                    {car.brand} {car.model}
                  </div>
                  <div className="text-accent font-semibold uppercase text-2xl mb-2">
                    Price: ₱{car.price}/day
                  </div>
                  <div className="text-blue-500 mb-4">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className={index < rating ? 'text-blue-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="mb-4">⚙️ Transmission: {car.transmission}</div>
                  <div className="mb-4">👤 Capacity: {car.capacity} persons</div>
                  <div className="mb-4">🧳 Luggage: {car.luggage} pieces</div>
                  <div className="mb-4">🚪 Doors: {car.doors}</div>
                  <div className="mb-4">
                    Features:
                    <ul className="list-disc pl-5 mt-2">
                      {JSON.parse(car.features).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-4">{car.description}</p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Link href="/browsecars" passHref>
                  <button className="btn btn-secondary text-lg py-3 px-6 text-xl font-semibold">
                    Browse Cars
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CarSlider = () => {
  const [cars, setCars] = useState([]);
  const [ratings, setRatings] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    // Fetch car data from the server
    const fetchCarData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/carslider/data-retrieve`);
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching car data:", error);
      }
    };

    // Fetch average ratings for cars
    const fetchRatings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/cars/ratings`);
        const data = await response.json();
        setRatings(data);
      } catch (error) {
        console.error("Error fetching car ratings:", error);
      }
    };

    fetchCarData();
    fetchRatings();
  }, []);

  return (
    <motion.div
      variants={fadeIn('up', 0.4)}
      initial='hidden'
      whileInView={'show'}
      viewport={{ once: false, amount: 0.2 }}
      className='container mx-auto'
    >
      <Swiper
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 15 },
          640: { slidesPerView: 2, spaceBetween: 32 },
          1260: { slidesPerView: 3, spaceBetween: 32 },
        }}
      >
        {cars.map((car) => (
          <SwiperSlide key={car.id}>
            <div className='max-w-[385px] mx-auto sm:mx-0'>
              {car.image ? (
                <Image
                  src={`data:image/svg+xml;base64,${car.image}`}
                  width={380}
                  height={284}
                  alt={`${car.brand} ${car.model}`}
                />
              ) : (
                <div className="bg-gray-200 w-full h-[284px]">
                  No image available
                </div>
              )}
              <div className='flex justify-between'>
                <div>
                  <div className='text-[13px] text-gray-500 uppercase'>
                    {car.type}
                  </div>
                  <h3 className='text-lg uppercase font-bold'>{car.brand} {car.model}</h3>
                  <div className='mb-2 text-accent font-semibold uppercase'>
                    ₱{car.price}/day
                  </div>
                  <div className="text-blue-500 mb-2">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className={index < (ratings[car.id] || 0) ? 'text-blue-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                className='btn btn-accent btn-lg'
                onClick={() => setSelectedCar(car)}
              >
                See details
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <AnimatePresence>
        {selectedCar && (
          <Modal 
            car={selectedCar} 
            rating={ratings[selectedCar.id] || 0}
            onClose={() => setSelectedCar(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CarSlider;