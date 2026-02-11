import React from 'react'
import { Dialog } from '@headlessui/react'
import { format } from 'date-fns'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCarSide, FaUser } from 'react-icons/fa'

export function ChangeConfirmationDialog({ isOpen, onClose, onConfirm, bookingDetails, originalBooking }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900 mb-4 border-b pb-3">
            Confirm Booking Changes
          </Dialog.Title>

          <div className="space-y-4 mb-6">
            {bookingDetails.carId !== originalBooking.car_id && (
              <div className="flex items-start gap-3">
                <FaCarSide className="text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Car Changed</h3>
                  <p className="text-sm text-red-500">Vehicle selection has been modified</p>
                </div>
              </div>
            )}

        <div className="flex items-start gap-3">
        <FaCalendarAlt className="text-blue-500 mt-1" />
        <div>
            <h3 className="font-medium text-gray-900">Rental Period</h3>
            <div className="space-y-1">
            <p className="text-sm text-gray-600">
                New: 
                {bookingDetails.dateRanges[0].startDate
                ? format(new Date(bookingDetails.dateRanges[0].startDate), 'MMM dd, yyyy')
                : 'Invalid Date'} -{' '}
                {bookingDetails.dateRanges[0].endDate
                ? format(new Date(bookingDetails.dateRanges[0].endDate), 'MMM dd, yyyy')
                : 'Invalid Date'}
            </p>
            <p className="text-sm text-gray-500">
                Original: 
                {originalBooking.pickup_date
                ? format(new Date(originalBooking.pickup_date), 'MMM dd, yyyy')
                : 'Invalid Date'} -{' '}
                {originalBooking.return_date
                ? format(new Date(originalBooking.return_date), 'MMM dd, yyyy')
                : 'Invalid Date'}
            </p>
            </div>
        </div>
        </div>

            {/* Time Changes */}
            <div className="flex items-start gap-3">
              <FaClock className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Pick-up & Return Time</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    New: Pick-up: {bookingDetails.pickupTime} | Return: {bookingDetails.returnTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    Original: Pick-up: {originalBooking.pickup_time.slice(0, 5)} | Return: {originalBooking.return_time.slice(0, 5)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Changes */}
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Locations</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pick-up Location:</p>
                    <p className="text-sm text-gray-600">{bookingDetails.pickupLocation}</p>
                    {bookingDetails.pickupLocation !== originalBooking.pickup_location && (
                      <p className="text-sm text-gray-500">Original: {originalBooking.pickup_location}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Return Location:</p>
                    <p className="text-sm text-gray-600">{bookingDetails.returnLocation}</p>
                    {bookingDetails.returnLocation !== originalBooking.return_location && (
                      <p className="text-sm text-gray-500">Original: {originalBooking.return_location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-sm text-blue-700">
              Note: Changes may affect the final price. You will receive an updated quote in your notifications.
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
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirm Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

