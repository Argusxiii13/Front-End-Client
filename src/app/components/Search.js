'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// components
import LocationSelection from './LocationSelection';
import DateSelection from './DateSelection';
import VehicleSelection from './vehicleselection';

export default function Search() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState({ startDate: null, endDate: null });
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleSearchClick = () => {
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
    <div className='hidden xl:block w-full fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-[1300px] z-[999] bg-white rounded-[20px] py-6 xl:pr-4 xl:h-[98px] shadow-lg transition-all duration-300'>
      <div className='flex h-full'>
        <LocationSelection onSelect={handleLocationSelect} />
        <VehicleSelection onSelect={handleVehicleSelect} />
        <DateSelection onSelect={handleDateSelect} selectedVehicle={selectedVehicle} />
        <div className='xl:h-full flex items-center px-6 xl:px-0'>
          <button
            onClick={handleSearchClick}
            className='btn btn-lg btn-accent xl:w-[184px]'>
            Proceed
          </button>
        </div>
      </div>

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-4">Confirmation</h2>
            <p>You need to Sign In to Book a Vehicle.</p>
            <div className="flex justify-end mt-4">
              <button onClick={handleCancelRedirect} className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
                Cancel
              </button>
              <button onClick={handleConfirmRedirect} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Yes, Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}