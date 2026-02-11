'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function LocationSelection({ onSelect }) { // Destructure props here
  const [location, setLocation] = useState('Select Location');
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (input) => {
    setError(null);
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
      if (!apiKey) {
        throw new Error('Mapbox API key is not configured');
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?access_token=${apiKey}&country=ph&types=address,place,locality,neighborhood,poi&autocomplete=true&limit=5`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.features.map((feature) => feature.place_name));
      setIsOpen(true);
    } catch (error) {
      setError(error.message);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    fetchSuggestions(input);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setIsInputVisible(false);
    
    // Notify parent component of the selection
    onSelect(suggestion); // Call the onSelect prop
  };

  const handleLocationClick = () => {
    setIsInputVisible(true);
  };

  return (
    <div ref={wrapperRef} className="w-full h-full flex xl:flex-row relative">
      <div className="relative flex-1">
        <div className="w-full h-full flex flex-col justify-center items-center xl:items-start xl:pl-8">
          <div className="w-full h-16 xl:h-full flex justify-center xl:justify-start xl:border-r xl:border-black/10">
            <div className="flex flex-col justify-center">
              <div className="flex flex-col xl:flex-row items-center xl:gap-x-2 gap-y-2 xl:gap-y-0">
                <FaMapMarkerAlt className="text-accent" />
                <div
                  className="text-[15px] uppercase font-bold cursor-pointer"
                  onClick={handleLocationClick}
                >
                  {location}
                </div>
              </div>
              {isInputVisible && (
                <>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => setIsOpen(true)}
                    placeholder="Enter Pickup Address"
                    className="w-full p-2 text-[13px] uppercase font-medium text-secondary text-center xl:ml-6 xl:text-left"
                  />
                  {error && (
                    <div className="text-red-500 text-xs mt-1 text-center xl:text-left">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="shadow-lg absolute top-full mt-2 left-1/2 xl:left-0 z-10 transform -translate-x-1/2 xl:-translate-x-0 text-sm text-center xl:text-left w-full bg-white max-w-[332px] py-6 rounded-[10px]">
            {suggestions.map((suggestion, index) => (
              <div
                onClick={() => handleSuggestionClick(suggestion)}
                key={index}
                className="cursor-pointer py-4 xl:pl-10 hover:bg-gray-50 text-[13px] uppercase"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}