"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingModal from './BookingModal';

export default function Fleet() {
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [filters, setFilters] = useState({ type: '', brand: '' });
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [carToBook, setCarToBook] = useState(null);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false); // State to manage toast visibility
  const [shouldAutoOpenModal, setShouldAutoOpenModal] = useState(false);

  const Toast = ({ message, onClose }) => {
    return (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded shadow-lg transition duration-300 ease-in-out">
            {message}
            <button onClick={onClose} className="ml-4 text-white underline">
                Close
            </button>
        </div>
    );
};

useEffect(() => {
  if (typeof window !== 'undefined') {
      checkLoginStatus()
  }
}, []);
useEffect(() => {
  const checkForSearchData = () => {
    const searchDataStr = localStorage.getItem('searchData');
    if (searchDataStr) {
      const searchData = JSON.parse(searchDataStr);
      console.log(searchData);
      
      // Find the matching car if vehicleId was provided
      if (searchData.vehicleId) {
        const matchingCar = allCars.find(car => car.id === searchData.vehicleId);
        if (matchingCar) {
          openBookingModal(matchingCar);
          
          // Clear the search data after using it
          localStorage.removeItem('searchData');
        }
      }
    }
  };

  // Only check for search data once cars are loaded
  if (allCars.length > 0) {
    checkForSearchData();
  }
}, [allCars]); // Dependency on allCars ensures we have the data before checking

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (allCars.length > 0) {
      // Get unique types and brands from the actual data
      const types = [...new Set(allCars.map(car => car.type))];
      const brands = [...new Set(allCars.map(car => car.brand))];
      
      setUniqueTypes(types);
      setUniqueBrands(brands);
    }
  }, [allCars]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldOpenModal = params.get('openModal') === 'true';
    const shouldAutoBook = params.get('autoBook') === 'true';
    
    if (shouldOpenModal && shouldAutoBook) {
      setShouldAutoOpenModal(true);
    }
  }, []);

  useEffect(() => {
    if (shouldAutoOpenModal && filteredCars.length > 0) {
      // Use the first car that matches the filters
      openBookingModal(filteredCars[0]);
      setShouldAutoOpenModal(false); // Reset the flag
    }
  }, [filteredCars, shouldAutoOpenModal]); // Dependencies for both filteredCars and the flag

  const checkLoginStatus = () => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        const isLoggedInStr = localStorage.getItem('isLoggedIn');
        
        let userData;
        try {
            userData = JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }

        const loggedIn = isLoggedInStr === 'true' && userData && userData.id;
        setIsLoggedIn(loggedIn);
    }
};


  const fetchCars = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/cars/fetching`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Fetched cars:', data); // Log the fetched data
  
      const carsWithImages = data.map(car => ({
        ...car,
        image: car.image ? `data:image/svg+xml;base64,${car.image}` : null
      }));
  
      setAllCars(carsWithImages);
      setFilteredCars(carsWithImages);
    } catch (error) {
      console.error('Error fetching cars:', error);
      alert('Failed to fetch cars. Please try again later.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filterCars = () => {
    const { type, brand } = filters;
    const newFilteredCars = allCars.filter(car => {
      return (!type || car.type.toLowerCase() === type.toLowerCase()) &&
             (!brand || car.brand.toLowerCase() === brand.toLowerCase());
    });
    setFilteredCars(newFilteredCars);
  };

  const openBookingModal = (car) => {
    if (isLoggedIn) {
      setSelectedCar(car);
      setIsBookingModalOpen(true);
    } else {
      setCarToBook(car); // Store the car to book
      setIsConfirmationModalOpen(true); // Open the confirmation modal
    }
  };

  const handleConfirmRedirect = () => {
    setIsConfirmationModalOpen(false);
    router.push('/signin'); // Redirect to sign-in
  };

  const handleCancelRedirect = () => {
    setIsConfirmationModalOpen(false); // Close modal without redirecting
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <main className="pt-16">
      <section
        className="relative py-20 bg-cover bg-center animate-fadeIn"
        style={{ backgroundImage: "url('/images/carSlider/banner2.svg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/70 animate-fadeIn"></div>
        <div className="container mx-auto px-5 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg animate-slideUp">
            OUR FLEET
          </h1>
          <p className="text-xl text-white drop-shadow-md max-w-3xl mx-auto animate-slideUp animation-delay-200">
            Browse our collection of well-maintained and clean vehicles, each accompanied by a professional chauffeur to ensure a comfortable and stress-free journey.
          </p>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="w-full md:w-1/2 p-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Car Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-1/2 p-4">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Car Brand
              </label>
              <select
                id="brand"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="w-full flex justify-center mt-4">
              <button
                onClick={filterCars}
                className="bg-blue-600 text-white px-8 py-3 rounded-md transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="space-y-8">
  {filteredCars.length > 0 ? (
    filteredCars.map((car, index) => (
      <div
        key={car.id}
        className={`animate-slideUp`}
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <CarCard car={car} onBookNow={() => openBookingModal(car)} />
      </div>
    ))
  ) : (
    <p className="text-gray-700">No cars available.</p>
  )}
</div>
        </div>
      </section>
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        carDetails={selectedCar}
        user_id={isLoggedIn ? JSON.parse(localStorage.getItem('user')).id : null}
      />
              {/* Your existing modal and other content */}

              {showToast && (
            <Toast 
                message="Booking created successfully!" 
                onClose={() => setShowToast(false)} 
            />
        )}

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleUp">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to your account to book this vehicle.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelRedirect}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md transition-all duration-300 hover:bg-gray-50 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedirect}
                className="px-6 py-2 bg-blue-600 text-white rounded-md transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </main>
  );
}

function CarCard({ car, onBookNow }) {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="md:w-1/2 overflow-hidden">
        <img 
          src={car.image} 
          alt={car.model} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
        />
      </div>
      <div className="md:w-1/2 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{car.brand} {car.model} {car.transmission}</h2>
            <p className="text-xl text-blue-600 font-semibold mt-2">Price Starts from: ₱ {car.price}</p>
          </div>
          <button
            onClick={onBookNow}
            className="bg-blue-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Book Now
          </button>
        </div>
        <div className="flex space-x-6 mb-6 text-gray-600">
          <span className="flex items-center transition-transform duration-300 hover:scale-110">👤 {car.capacity}</span>
          <span className="flex items-center transition-transform duration-300 hover:scale-110">🧳 {car.luggage}</span>
          <span className="flex items-center transition-transform duration-300 hover:scale-110">🚪 {car.doors}</span>
          <span className="flex items-center transition-transform duration-300 hover:scale-110">⚙️ {car.transmission}</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 mb-6 text-gray-600">
          {JSON.parse(car.features).map((feature, index) => (
            <li key={index} className="flex items-center transition-transform duration-300 hover:translate-x-2">
              <span className="mr-2">•</span> {feature}
            </li>
          ))}
        </ul>
        <p className="text-gray-600 leading-relaxed">{car.description}</p>
      </div>
    </div>
  );
}