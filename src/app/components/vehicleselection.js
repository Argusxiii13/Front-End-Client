'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { FaCar } from 'react-icons/fa';
import axios from 'axios';

export default function VehicleSelection({ onSelect }) {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState('Select Vehicle');
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carsPerPage = 5; // Number of cars to show at a time

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/cars`);
      setCars(response.data);
    } catch (error) {
      console.error('Could not load car data:', error);
    }
  };

  const handleCarSelect = (car) => {
    setSelectedCar(`${car.brand} ${car.model}`);
    if (typeof onSelect === 'function') {
      onSelect(car);
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentIndex + carsPerPage < cars.length) {
      setCurrentIndex(currentIndex + carsPerPage);
    }
  };

  const handlePrevious = () => {
    if (currentIndex - carsPerPage >= 0) {
      setCurrentIndex(currentIndex - carsPerPage);
    }
  };

  return (
    <Menu as='div' className='w-full h-full flex flex-row items-center'>
      <div className='relative flex-1'>
        <Menu.Button
          className='dropdown-btn w-full h-full flex flex-col items-center sm:items-start justify-center px-4 xl:pl-8'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className='flex flex-row items-center justify-center sm:justify-start gap-x-2 w-full'>
            <FaCar className='text-accent' />
            <div className='text-[15px] uppercase font-bold'>Select Vehicle</div>
          </div>
          <div className='text-[13px] font-medium text-secondary sm:ml-6 mt-1'>
            {selectedCar}
          </div>
        </Menu.Button>

        {isOpen && (
          <Menu.Items
            className='dropdown-menu shadow-lg absolute top-[100%] left-0 z-50 w-full bg-white max-w-[332px] py-4 rounded-[10px]'
            static
          >
            <div className='w-full flex justify-between px-4 mb-2'>
              <button
                className='text-[13px] uppercase font-bold text-accent disabled:opacity-50'
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button
                className='text-[13px] uppercase font-bold text-accent disabled:opacity-50'
                onClick={handleNext}
                disabled={currentIndex + carsPerPage >= cars.length}
              >
                Next
              </button>
            </div>
            {cars.slice(currentIndex, currentIndex + carsPerPage).map((car) => (
              <Menu.Item key={car.id}>
                {({ active }) => (
                  <div
                    className={`cursor-pointer py-2 px-4 hover:bg-gray-50 text-[13px] uppercase ${
                      active ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleCarSelect(car)}
                  >
                    {`${car.brand} ${car.model}`}
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        )}
      </div>
    </Menu>
  );
}

