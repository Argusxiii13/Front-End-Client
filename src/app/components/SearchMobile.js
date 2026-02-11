'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DateSelection from './DateSelection';
import LocationSelection from './LocationSelection';
import VehicleSelection from './vehicleselection';

export default function SearchMobile() {
  const [isFloating, setIsFloating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState({ startDate: null, endDate: null });
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 200;
      setIsFloating(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearchClick = () => {
    console.log('Location:', location);
    console.log('Selected Vehicle:', selectedVehicle);
    console.log('Start Date:', dates.startDate);
    console.log('End Date:', dates.endDate);
  
    if (isLoggedIn) {
      const searchData = {
        location,
        vehicleId: selectedVehicle ? selectedVehicle.id : null,
        startDate: dates.startDate ? dates.startDate.getTime() : null,
        endDate: dates.endDate ? dates.endDate.getTime() : null
      };
  
      localStorage.setItem('searchData', JSON.stringify(searchData));
      router.push('/browsecars');
    } else {
      setIsConfirmationModalOpen(true);
    }
  };

  const handleConfirmRedirect = () => {
    setIsConfirmationModalOpen(false);
    router.push('/signin');
  };

  const handleCancelRedirect = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleDateSelect = (selectedDates) => {
    setDates(selectedDates);
  };

  return (
    <div className={`xl:hidden font-medium ${isFloating ? 'fixed top-0 left-0 right-0 z-1000 bg-white shadow-lg' : ''}`}>
      <div className='container mx-auto'>
        <div className='flex flex-col gap-y-4'>
          <LocationSelection onSelect={handleLocationSelect} />
          <VehicleSelection onSelect={handleVehicleSelect} />
          <DateSelection onSelect={handleDateSelect} selectedVehicle={selectedVehicle} />
          <div className='flex items-center px-6'>
            <button className='btn btn-sm btn-accent w-[164px] mx-auto' onClick={handleSearchClick}>
              Proceed
            </button>
          </div>
        </div>
      </div>

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-4">Confirmation</h2>
            <p>You need to Sign In to Book a Vehicle.</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCancelRedirect}
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedirect}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Yes, Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

