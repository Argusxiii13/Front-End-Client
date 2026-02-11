'use client';

import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { FaClock } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00';
  } else {
    hours = modifier === 'PM' ? String(Number(hours) + 12) : hours.padStart(2, '0');
  }
  
  return `${hours}:${minutes}`;
};

// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  
  let period = 'AM';
  let hour12 = hour;
  
  if (hour === 0) {
    hour12 = 12;
  } else if (hour === 12) {
    period = 'PM';
  } else if (hour > 12) {
    hour12 = hour - 12;
    period = 'PM';
  }
  
  return `${hour12}:${minutes} ${period}`;
};

const QuarterHourSelector = ({ value, onChange }) => {
  // Generate times for every hour with quarter increments (00, 30)
  const times = Array.from({ length: 24 }, (_, hour) => {
    return ['00', '30'].map(minutes => {
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes}`;
      return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    });
  }).flat();

  return (
    <div className="max-h-48 overflow-y-auto">
      {times.map((time, index) => (
        <div
          onClick={() => onChange(time)}
          className={`cursor-pointer py-2 px-4 text-center hover:bg-gray-50 transition-colors ${
            value === time ? 'bg-gray-50' : ''
          }`}
          key={index}
        >
          {time}
        </div>
      ))}
    </div>
  );
};

export default function HoursSelection() {
  const [startTime, setStartTime] = useState('7:00 AM');
  const [endTime, setEndTime] = useState('3:00 PM');
  const [isCustomTime, setIsCustomTime] = useState(false);

  // Convert 12-hour times to 24-hour format for input values
  const startTime24 = convertTo24Hour(startTime);
  const endTime24 = convertTo24Hour(endTime);

  const handleTimeChange = (timeStr, setTimeFunction) => {
    // Convert the 24-hour time from input to 12-hour format
    const time12 = convertTo12Hour(timeStr);
    setTimeFunction(time12);
  };

  return (
    <Menu as='div' className='w-full h-full flex xl:flex-row'>
      <div className='relative flex-1'>
        <Menu.Button className='dropdown-btn w-full h-full flex flex-col justify-center items-center xl:items-start xl:pl-8'>
          <div className='flex flex-col xl:flex-row items-center xl:gap-x-2 gap-y-2 xl:gap-y-0'>
            <FaClock className='text-accent' />
            <div className='text-[15px] uppercase font-bold'>Select Hours</div>
          </div>

          <div className='flex items-center justify-center gap-x-3'>
            <div className='font-medium text-[13px] text-secondary xl:ml-6'>
              {startTime}
            </div>
            <FaArrowRightLong className='text-accent text-[12px]' />
            <div className='font-medium text-[13px] text-secondary'>{endTime}</div>
          </div>
        </Menu.Button>

        <Menu.Items className='dropdown-menu shadow-lg absolute -top-72 xl:top-[90px] left-1/2 xl:left-0 z-10 transform -translate-x-1/2 xl:-translate-x-0 text-sm w-full bg-white max-w-[332px] rounded-[10px] divide-y divide-gray-100'>
          <div className="p-4">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={isCustomTime}
                onChange={(e) => setIsCustomTime(e.target.checked)}
                className="rounded text-accent focus:ring-accent"
              />
              <span className="text-sm">Custom Time</span>
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                {isCustomTime ? (
                  <input
                    type="time"
                    value={startTime24}
                    onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                ) : (
                  <QuarterHourSelector
                    value={startTime}
                    onChange={setStartTime}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                {isCustomTime ? (
                  <input
                    type="time"
                    value={endTime24}
                    onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                ) : (
                  <QuarterHourSelector
                    value={endTime}
                    onChange={setEndTime}
                  />
                )}
              </div>
            </div>
          </div>
        </Menu.Items>
      </div>
    </Menu>
  );
}