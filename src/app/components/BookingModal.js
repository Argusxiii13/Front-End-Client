import React, { useState, useEffect, useRef } from 'react'
import { Menu } from '@headlessui/react'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCarSide, FaUser, FaEnvelope, FaPhone, FaPen, FaInfoCircle } from 'react-icons/fa'
import { FaArrowRightLong } from 'react-icons/fa6'
import { DateRange } from 'react-date-range'
import { format, addDays, isSameDay } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import axios from 'axios'
import Toast from './animated-toast'
import { ConfirmationDialog } from './confirmation-dialog'

const apiKey = process.env.NEXT_PUBLIC_MAPBOX_API_KEY

const LocationAutocomplete = ({ value, onChange, label, placeholder }) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?access_token=${apiKey}&country=ph&types=address,place,locality,neighborhood,poi&autocomplete=true&limit=5`
      )
      const data = await response.json()
      setSuggestions(data.features || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
    setIsLoading(false)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    onChange(value)
    setShowSuggestions(true)
    fetchSuggestions(value)
  }

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.place_name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TimePicker = ({ onChange, name, value }) => (
  <input
    type="time"
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  />
)

export default function BookingModal({ isOpen, onClose, carDetails, user_id }) {
  const [formData, setFormData] = useState({
    pickup_location: '',
    returnLocation: '',
    name: '',
    email: '',
    phoneNumber: '',
    type: carDetails ? carDetails.type : '',
    carId: carDetails ? carDetails.id : '',
    pickupTime: '09:00',
    returnTime: '17:00',
    additionalRequests: '',
  });

  const [selectedCar, setSelectedCar] = useState('');
  const [dateRanges, setDateRanges] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const [occupiedDates, setOccupiedDates] = useState([]);
  const [toast, setToast] = useState(null);
  const [cars, setCars] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Retrieve data from localStorage
    const storedData = JSON.parse(localStorage.getItem('searchData'));
    if (storedData) {
      const startDate = storedData.startDate ? new Date(storedData.startDate) : null;
      const endDate = storedData.endDate ? new Date(storedData.endDate) : null;

      setFormData((prevData) => ({
        ...prevData,
        pickup_location: storedData.location || '',
      }));

      setDateRanges([{ startDate, endDate, key: 'selection' }]);
    }
  }, []);

  useEffect(() => {
    if (carDetails) {
      setSelectedCar(`${carDetails.brand} ${carDetails.model}`);
      setFormData((prevData) => ({
        ...prevData,
        type: carDetails.type,
        carId: carDetails.id,
      }));
      fetchOccupiedDates(carDetails.id);
    }
    fetchCars();
    if (user_id) {
      fetchUserDetails(user_id);
    }
  }, [carDetails, user_id]);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/cars`);
      setCars(response.data);
    } catch (error) {
      setToast({ message: 'Could not load car data.', type: 'error' });
    }
  };

  const fetchUserDetails = async (user_id) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/${user_id}`);
      const { name, email, phonenumber } = response.data;
      setFormData((prevData) => ({
        ...prevData,
        name,
        email,
        phoneNumber: phonenumber,
      }));
    } catch (error) {
      setToast({ message: 'Could not load user details.', type: 'error' });
    }
  };

  const fetchOccupiedDates = async (carId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/occupied-dates/${carId}`);
      setOccupiedDates(response.data);
    } catch (error) {
      setToast({ message: 'Could not load occupied dates.', type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCarChange = (e) => {
    const value = e.target.value;
    setSelectedCar(value);

    const car = cars.find((car) => `${car.brand} ${car.model}` === value);
    if (car) {
      setFormData((prevData) => ({
        ...prevData,
        type: car.type,
        carId: car.id,
      }));
      fetchOccupiedDates(car.id);
    }
  };

  const handleDateChange = (item) => {
    setDateRanges([item.selection]);
  };

  const handleLocationChange = (field) => (value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    const bookingData = {
      pickupLocation: formData.pickup_location,
      returnLocation: formData.returnLocation,
      pickupDate: format(dateRanges[0].startDate, 'yyyy-MM-dd'),
      returnDate: dateRanges[0].endDate
        ? format(dateRanges[0].endDate, 'yyyy-MM-dd')
        : format(dateRanges[0].startDate, 'yyyy-MM-dd'),
      pickupTime: formData.pickupTime,
      returnTime: formData.returnTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phoneNumber,
      rentalType: formData.type,
      carId: formData.carId,
      user_id: user_id,
      additionalrequest: formData.additionalRequests || 'None',
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings`, bookingData);
      setToast({ message: 'Booking Quote created successfully!', type: 'success' });
      setShowConfirmation(false);
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMsg = error.response ? error.response.data.message : 'Error creating booking';
      setToast({ message: errorMsg, type: 'error' });
      setShowConfirmation(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pickup_location: '',
      returnLocation: '',
      name: '',
      email: '',
      phoneNumber: '',
      type: carDetails ? carDetails.type : '',
      carId: carDetails ? carDetails.id : '',
      pickupTime: '09:00',
      returnTime: '17:00',
      additionalRequests: '',
    });
    setSelectedCar('');
    setDateRanges([{ startDate: new Date(), endDate: null, key: 'selection' }]);
  };

  const handleClose = () => {
    onClose();
    setToast(null);
  };

  const isDayDisabled = (date) => {
    return occupiedDates.some((occupied) => {
      const start = new Date(occupied.startDate);
      const end = new Date(occupied.endDate);
      return isSameDay(date, start) || isSameDay(date, end) || (date >= start && date <= end);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Rent a car at low prices</h2>
          <button 
            onClick={handleClose} 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div>
            <label htmlFor="car-select" className="block text-sm font-medium text-gray-700 mb-1">Car</label>
            <select
              id="car-select"
              value={selectedCar}
              onChange={handleCarChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a car</option>
              {cars.map((car) => (
                <option key={car.id} value={`${car.brand} ${car.model}`}>
                  {`${car.brand} ${car.model}`}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
              <p>
                Driver, gas fees, and toll fees are included in this booking. 
                You will see the total price when you receive the payment quote on the Notifications.
              </p>
            </div>
          </div>
          <div>
  <Menu as="div" className="relative">
    <Menu.Button className="w-full p-3 border rounded-md flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      <div className="flex items-center gap-2">
        <FaCalendarAlt className="text-blue-500" />
        <span>Select Date</span>
      </div>
      <div className="flex items-center gap-3">
        <div>
          {dateRanges[0]?.startDate && !isNaN(dateRanges[0].startDate) 
            ? format(dateRanges[0].startDate, 'dd/MM/yyyy')
            : 'Select date'}
        </div>
        <FaArrowRightLong className="text-blue-500" />
        <div>
          {dateRanges[0]?.endDate && !isNaN(dateRanges[0].endDate)
            ? format(dateRanges[0].endDate, 'dd/MM/yyyy')
            : 'Select date'}
        </div>
      </div>
    </Menu.Button>
    <Menu.Items className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg">
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
  </Menu>
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationAutocomplete
            label="Pick-up location"
            value={formData.pickup_location}
            onChange={handleLocationChange('pickup_location')}
            placeholder="Enter pick-up address"
          />
          <LocationAutocomplete
            label="Drop-Off Location"
            value={formData.returnLocation}
            onChange={handleLocationChange('returnLocation')}
            placeholder="Enter Drop-Off Location"
          />
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Pick-up Time
              </label>
              <TimePicker
                id="pickup-time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="return-time" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Return Time
              </label>
              <TimePicker
                id="return-time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaPhone className="text-blue-500" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="additional-requests" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaPen className="text-blue-500" />
              Additional Requests
            </label>
            <textarea
              id="additional-requests"
              name="additionalRequests"
              value={formData.additionalRequests}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional requests or special requirements"
            />
          </div>

          <div>
            <label htmlFor="rental-type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaCarSide className="text-blue-500" />
              Rental Type
            </label>
            <select
              id="rental-type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Rental Type</option>
              <option value="personal">For Personal</option>
              <option value="company">For Company</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              This will be reviewed and you will receive a notification on this website for the booking status and its price.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            GET A QUOTE NOW
          </button>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmedSubmit}
        bookingDetails={{
          selectedCar,
          pickupLocation: formData.pickup_location,
          returnLocation: formData.returnLocation,
          dateRanges,
          pickupTime: formData.pickupTime,
          returnTime: formData.returnTime,
          name: formData.name,
          type: formData.type
        }}
      />
    </div>
  )
}

