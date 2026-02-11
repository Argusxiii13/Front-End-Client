import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { format } from 'date-fns'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCarSide, FaUser } from 'react-icons/fa'

export function ConfirmationDialog({ isOpen, onClose, onConfirm, bookingDetails }) {
  const [isConfirming, setIsConfirming] = useState(false)

  const formatDate = (date) => {
    return date instanceof Date && !isNaN(date) ? format(date, 'dd - MM - yyyy') : 'Invalid date';
  }

  const startDate = bookingDetails.dateRanges[0]?.startDate;
  const endDate = bookingDetails.dateRanges[0]?.endDate;
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  const handleConfirm = () => {
    setIsConfirming(true) // Disable button
    onConfirm() // Call the confirm function

    // Reset button state after 3 seconds
    setTimeout(() => {
      setIsConfirming(false)
    }, 3000)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900 mb-4 border-b pb-3">
            Confirm Your Booking Quote
          </Dialog.Title>

          <div className="space-y-4 mb-6">
            {/* Car Details */}
            <div className="flex items-start gap-3">
              <FaCarSide className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Selected Vehicle</h3>
                <p className="text-gray-600">{bookingDetails.selectedCar}</p>
                <p className="text-sm text-gray-500">For {bookingDetails.type}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Rental Period</h3>
                <p className="text-gray-600">
                  {formattedStartDate} → {formattedEndDate}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <FaClock className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Pick-up & Return Time</h3>
                <p className="text-gray-600">
                  Pick-up: {bookingDetails.pickupTime} | Return: {bookingDetails.returnTime}
                </p>
              </div>
            </div>

            {/* Locations */}
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Locations</h3>
                <div className="text-gray-600">
                  <p><span className="text-gray-500">Pick-up:</span> {bookingDetails.pickupLocation}</p>
                  <p><span className="text-gray-500">Return:</span> {bookingDetails.returnLocation}</p>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-start gap-3">
              <FaUser className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Customer Name</h3>
                <p className="text-gray-600">{bookingDetails.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-sm text-blue-700">
              Note: The final price will be sent to your notifications after review. 
              Driver, gas fees, and toll fees are included in the quote.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isConfirming ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
            >
              {isConfirming ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

