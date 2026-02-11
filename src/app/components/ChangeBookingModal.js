'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu } from '@headlessui/react'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCarSide, FaUser, FaEnvelope, FaPhone, FaPen, FaInfoCircle } from 'react-icons/fa'
import { FaArrowRightLong } from 'react-icons/fa6'
import { DateRange } from 'react-date-range'
import { format, addDays, isWithinInterval, startOfDay, isSameDay } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import axios from 'axios'
import Toast from './animated-toast'
import { ChangeConfirmationDialog } from './change-confirmation-dialog'
import { CancelBookingDialog } from './cancel-booking-dialog'

const apiKey = process.env.NEXT_PUBLIC_MAPBOX_API_KEY

const LocationAutocomplete = ({ value, onChange, label, placeholder, disabled }) => {
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
    if (!input || disabled) {
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
    if (disabled) return
    
    const value = e.target.value
    onChange(value)
    setShowSuggestions(true)
    fetchSuggestions(value)
  }

  const handleSuggestionClick = (suggestion) => {
    if (disabled) return
    
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
          className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? 'bg-gray-200 cursor-not-allowed' : ''
          }`}
          required
          disabled={disabled}
          readOnly={disabled}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault()
              return
            }
            setShowSuggestions(true)
          }}
        />
      </div>
      {isLoading && !disabled && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && !disabled && (
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

const TimePicker = ({ onChange, name, value, disabled }) => (
  <input
    type="time"
    name={name}
    value={value}
    onChange={(e) => !disabled && onChange(e)}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      disabled ? 'bg-gray-200 cursor-not-allowed opacity-75' : ''
    }`}
    required
    step="1800"
    disabled={disabled}
    readOnly={disabled}
  />
)

export default function ChangeBookingModal({ isOpen, onClose, bookingData, user_id, onUpdate }) {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    returnLocation: '',
    name: '',
    email: '',
    phoneNumber: '',
    carId: '',
    pickupTime: '09:00',
    returnTime: '17:00',
    rentalType: 'personal',
    additionalrequest: '',
  })

  const [dateRanges, setDateRanges] = useState([{
    startDate: null,
    endDate: null,
    key: 'selection',
  }])

  const [occupiedDates, setOccupiedDates] = useState([])
  const [carOptions, setCarOptions] = useState([])
  const [originalDates, setOriginalDates] = useState({ start: null, end: null })
  const [currentCarId, setCurrentCarId] = useState('')
  const [toast, setToast] = useState(null)
  const [cancelConfirmation, setCancelConfirmation] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false)

  useEffect(() => {
    const fetchCarOptions = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/cars`)
      const data = await response.json()
      setCarOptions(data)
    }

    fetchCarOptions()
  }, [])

  useEffect(() => {
    if (bookingData) {
      setFormData({
        pickupLocation: bookingData.pickup_location || '',
        returnLocation: bookingData.return_location || '',
        name: bookingData.name || '',
        email: bookingData.email || '',
        phoneNumber: bookingData.phone || '',
        carId: bookingData.car_id || '',
        pickupTime: bookingData.pickup_time ? bookingData.pickup_time.slice(0, 5) : '09:00',
        returnTime: bookingData.return_time ? bookingData.return_time.slice(0, 5) : '17:00',
        rentalType: bookingData.rental_type || 'personal',
        additionalrequest: bookingData.additionalrequest || '',
      })

      const pickupDate = new Date(bookingData.pickup_date)
      const returnDate = new Date(bookingData.return_date)

      setDateRanges([{
        startDate: pickupDate,
        endDate: returnDate,
        key: 'selection',
      }])

      setOriginalDates({
        start: startOfDay(pickupDate),
        end: startOfDay(returnDate),
      })

      setCurrentCarId(bookingData.car_id)
      fetchOccupiedDates(bookingData.car_id)

      if (bookingData.status === 'Cancelled') {
        setIsCancelled(true)
      }
    }

    if (user_id) {
      fetchUserDetails(user_id)
    }
  }, [bookingData, user_id])

  const fetchUserDetails = async (user_id) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/${user_id}`)
    const { name, email, phoneNumber } = response.data
    setFormData((prevData) => ({
      ...prevData,
      name,
      email,
      phoneNumber,
    }))
  }

  const fetchOccupiedDates = async (carId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/occupied-dates/${carId}`)
    const data = await response.json()
    setOccupiedDates(data)
  }

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    if (name === 'carId') {
      setCurrentCarId(value)
      await fetchOccupiedDates(value)

      if (value !== bookingData.car_id) {
        const availableDate = await getNearestAvailableDate(value)
        if (availableDate) {
          const newEndDate = addDays(availableDate, 2)
          setDateRanges([{
            startDate: availableDate,
            endDate: newEndDate,
            key: 'selection',
          }])
        }
      } else {
        setDateRanges([{
          startDate: new Date(bookingData.pickup_date),
          endDate: new Date(bookingData.return_date),
          key: 'selection',
        }])
      }
    }
  }

  const getNearestAvailableDate = async (carId) => {
    const occupiedDatesSorted = occupiedDates.map(date => ({
      start: new Date(date.startDate),
      end: new Date(date.endDate),
    })).sort((a, b) => a.start - b.start)

    const today = startOfDay(new Date())

    for (let i = 0; i <= 365; i++) {
      const potentialDate = addDays(today, i)
      const isOccupied = occupiedDatesSorted.some(({ start, end }) => {
        return isWithinInterval(potentialDate, { start, end })
      })

      if (!isOccupied) {
        return potentialDate
      }
    }
    return null
  }

  const handleDateChange = (item) => {
    setDateRanges([item.selection])
  }

  const isDayDisabled = (date) => {
    if (currentCarId === bookingData.car_id) {
      if (
        (originalDates.start && isSameDay(date, originalDates.start)) ||
        (originalDates.end && isSameDay(date, originalDates.end)) ||
        (originalDates.start && originalDates.end && isWithinInterval(date, originalDates))
      ) {
        return false
      }
    }

    return occupiedDates.some((occupied) => {
      const start = new Date(occupied.startDate)
      const end = new Date(occupied.endDate)
      return isWithinInterval(date, { start, end })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowChangeConfirmation(true);
  }
  const userStr = localStorage.getItem('user')
  const user = JSON.parse(userStr)

  const handleConfirmedSubmit = async () => {
    const updatedBookingData = {
      pickup_location: formData.pickupLocation, // Change to match API expectation
      return_location: formData.returnLocation,
      pickup_date: format(dateRanges[0].startDate, 'yyyy-MM-dd'),
      pickup_time: formData.pickupTime,
      return_date: dateRanges[0].endDate
          ? format(dateRanges[0].endDate, 'yyyy-MM-dd')
          : format(dateRanges[0].startDate, 'yyyy-MM-dd'),
      return_time: formData.returnTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phoneNumber,
      car_id: formData.carId,
      rental_type: formData.rentalType,
      additionalrequest: formData.additionalrequest,
      user_id:user.id
  };



    try {
      if (!bookingData || !bookingData.booking_id) {
        throw new Error("Booking ID is required for updating the booking.")
      }

      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}api/booking/update/${bookingData.booking_id}`, updatedBookingData)
      setToast({ message: 'Booking updated successfully!', type: 'success' })
      setShowChangeConfirmation(false)

      setTimeout(() => {
        setToast(null)
        onUpdate()
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error updating booking:', error)
      setToast({ message: 'Failed to update booking. Please try again.', type: 'error' })
      setShowChangeConfirmation(false)
    }
  }

  const handleCancelBooking = async (reason) => {
    try {
        // Validate booking ID
        if (!bookingData?.booking_id) {
            setToast({ message: 'Invalid booking ID. Please try again.', type: 'error' });
            return;
        }

        // Validate reason
        if (!reason?.trim()) {
            setToast({ message: 'Please provide a reason for cancellation', type: 'error' });
            return;
        }

        // Prepare data for cancellation
        const cancelData = { cancel_reason: reason.trim(), user_id:user.id, clientEmail:user.email };

        // Make the request to cancel booking
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/cancel/${bookingData.booking_id}`, // Updated endpoint
            cancelData,
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Handle success response
        if (response.status === 200) {
            setToast({ message: 'Booking cancelled successfully!', type: 'success' });
            setCancelConfirmation(false);
            setIsCancelled(true);
            setTimeout(() => {
                setToast(null);
                onUpdate();
                onClose();
            }, 3000);
        }
    } catch (error) {
        console.error('Cancellation error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
        setToast({ message: errorMessage, type: 'error' });
    }
};

  const handleClose = () => {
    setToast(null)
    setCancelConfirmation(false)
    onClose()
  }

  if (!isOpen) return null

const isEditable = !(bookingData.status === "Finished" || bookingData.status === "Cancelled");

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">
          Change Booking
          {bookingData && bookingData.booking_id && (
    <span className="ml-2 text-sm font-normal text-gray-500">
        (ID: {bookingData.booking_id.toString().padStart(11, '0')})
    </span>
)}
        </h2>
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
            name="carId"
            value={formData.carId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!isEditable}
          >
            <option value="">Select Car</option>
            {carOptions.map(car => (
              <option key={car.id} value={car.id}>{`${car.brand} ${car.model}`}</option>
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

        {/* Date Selection */}
        <div>
          <Menu as="div" className="relative">
            <Menu.Button className="w-full p-3 border rounded-md flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!isEditable}>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                <span>Select Date</span>
              </div>
              <div className="flex items-center gap-3">
                <div>{dateRanges[0].startDate ? format(dateRanges[0].startDate, 'dd/MM/yyyy') : 'Select start date'}</div>
                <FaArrowRightLong className="text-blue-500" />
                <div>
                  {dateRanges[0].endDate
                    ? format(dateRanges[0].endDate, 'dd/MM/yyyy')
                    : (dateRanges[0].startDate ? format(dateRanges[0].startDate, 'dd/MM/yyyy') : 'Select end date')}
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
            value={formData.pickupLocation}
            onChange={(value) => setFormData(prev => ({ ...prev, pickupLocation: value }))}
            placeholder="Enter pick-up address"
            disabled={!isEditable}
          />
          <LocationAutocomplete
            label="Drop-Off Location"
            value={formData.returnLocation}
            onChange={(value) => setFormData(prev => ({ ...prev, returnLocation: value }))}
            placeholder="Enter Drop-Off Location"
            disabled={!isEditable}
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
              disabled={!isEditable}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isEditable ? 'bg-gray-200' : ''}`}
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
              disabled={!isEditable}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isEditable ? 'bg-gray-200' : ''}`}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditable ? 'bg-gray-200' : ''}`}
              required
              disabled={!isEditable}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditable ? 'bg-gray-200' : ''}`}
              required
              disabled={!isEditable}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditable ? 'bg-gray-200' : ''}`}
              required
              disabled={!isEditable}
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
            name="additionalrequest"
            value={formData.additionalrequest}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditable ? 'bg-gray-200' : ''}`}
            placeholder="Enter any additional requests or special requirements"
            disabled={!isEditable}
          />
        </div>

        <div>
          <label htmlFor="rental-type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaCarSide className="text-blue-500" />
            Rental Type
          </label>
          <select
            id="rental-type"
            name="rentalType"
            value={formData.rentalType}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditable ? 'bg-gray-200' : ''}`}
            required
            disabled={!isEditable}
          >
            <option value="personal">For Personal</option>
            <option value="company">For Company</option>
          </select>
        </div>

        <CancelBookingDialog
          isOpen={cancelConfirmation}
          onClose={() => setCancelConfirmation(false)}
          onConfirm={handleCancelBooking}
        />

        <ChangeConfirmationDialog
          isOpen={showChangeConfirmation}
          onClose={() => setShowChangeConfirmation(false)}
          onConfirm={handleConfirmedSubmit}
          bookingDetails={{
            carId: formData.carId,
            pickupLocation: formData.pickupLocation,
            returnLocation: formData.returnLocation,
            dateRanges,
            pickupTime: formData.pickupTime,
            returnTime: formData.returnTime,
            name: formData.name,
            type: formData.rentalType
          }}
          originalBooking={bookingData}
        />

        <button
          type="button"
          onClick={() => setCancelConfirmation(true)}
          className={`w-full py-2 px-4 rounded-md ${isEditable ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'} text-white transition duration-150 ease-in-out mb-2`}
          disabled={!isEditable}
        >
          Cancel Booking
        </button>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md ${isEditable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'} text-white transition duration-150 ease-in-out`}
          disabled={!isEditable}
        >
          Update Booking
        </button>
      </form>
    </div>
  </div>
);
}