'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { DateRange } from 'react-date-range';
import { format, addDays, isSameDay } from 'date-fns';
import axios from 'axios';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DateSelection({ selectedVehicle, onSelect }) {
  const [dateRanges, setDateRanges] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection',
    },
  ]);
  const [occupiedDates, setOccupiedDates] = useState([]);

  useEffect(() => {
    if (selectedVehicle) {
      fetchOccupiedDates(selectedVehicle.id);
    }
  }, [selectedVehicle]);

  const fetchOccupiedDates = async (carId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/occupied-dates/${carId}`);
      setOccupiedDates(response.data);
    } catch (error) {
      console.error('Could not load occupied dates:', error);
      setOccupiedDates([]);
    }
  };

  const handleDateChange = (item) => {
    setDateRanges([item.selection]);
    onSelect(item.selection); // Notify parent component of the selection
  };

  const isDayDisabled = (date) => {
    return occupiedDates.some((occupied) => {
      const start = new Date(occupied.startDate);
      const end = new Date(occupied.endDate);
      return isSameDay(date, start) || isSameDay(date, end) || (date >= start && date <= end);
    });
  };

  return (
    <Menu as='div' className='w-full h-full flex xl:flex-row'>
      <div className='relative flex-1'>
        <Menu.Button className='dropdown-btn w-full h-full flex flex-col justify-center items-center xl:items-start xl:pl-8'>
          <div className='flex flex-col xl:flex-row items-center xl:gap-x-2 gap-y-2 xl:gap-y-0'>
            <FaCalendarAlt className='text-accent' />
            <div className='text-[15px] uppercase font-bold'>Select Date</div>
          </div>
          <div className='flex items-center gap-x-3 xl:ml-6'>
            <div className='text-[13px] font-medium text-secondary'>
              {format(dateRanges[0].startDate, 'dd/MM/yyyy')}
            </div>
            <FaArrowRightLong className='text-accent text-[12px]' />
            <div className='text-[13px] font-medium text-secondary'>
              {dateRanges[0].endDate
                ? format(dateRanges[0].endDate, 'dd/MM/yyyy')
                : format(dateRanges[0].startDate, 'dd/MM/yyyy')}
            </div>
          </div>
        </Menu.Button>

        <Menu.Items className='drodown-menu shadow-lg absolute -top-96 xl:top-[90px] left-1/2 xl:left-0 z-50 transform -translate-x-1/2 xl:-translate-x-0 rounded-[10px] overflow-hidden'>
          <DateRange
            onChange={handleDateChange}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={dateRanges}
            rangeColors={['#1572D3']}
            minDate={addDays(new Date(), 0)}
            disabledDay={isDayDisabled}
          />
        </Menu.Items>
      </div>
    </Menu>
  );
}