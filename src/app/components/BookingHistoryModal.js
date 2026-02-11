'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ChangeBookingModal from './ChangeBookingModal';

export default function BookingHistoryModal({ isOpen, onClose, fetchBookingHistory }) {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangeBookingModalOpen, setIsChangeBookingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadBookingHistory();
        }
    }, [isOpen]);

    const loadBookingHistory = async () => {
        setIsLoading(true);
        const bookingHistory = await fetchBookingHistory();
        setBookings(bookingHistory);
        setIsLoading(false);
    };

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setIsChangeBookingModalOpen(true);
    };

    const refreshBookings = async () => {
        await loadBookingHistory();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Booking History</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {isLoading ? (
                    <p className="text-center py-4">Loading booking history...</p>
                ) : bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr 
                                        key={booking.booking_id} 
                                        onClick={() => handleBookingClick(booking)}
                                        className="hover:bg-gray-50 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
    {booking.booking_id.toString().padStart(11, '0')}
</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.rental_type.toUpperCase()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${booking.brand} ${booking.model}`}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                booking.status === 'Finished' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-4">No booking history found.</p>
                )}

                {/* Mobile View */}
                <div className="md:hidden mt-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.booking_id}
                            onClick={() => handleBookingClick(booking)}
                            className="mb-4 p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition duration-300 ease-in-out"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Booking #{booking.booking_id}</span>
                                <span className={`px-2 text-xs font-semibold rounded-full ${
                                    booking.status === 'Finished' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Car: {`${booking.brand} ${booking.model}`}</p>
                                <p>Type: {booking.rental_type.toUpperCase()}</p>
                                <p>Date: {new Date(booking.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change Booking Modal */}
            {isChangeBookingModalOpen && (
                <ChangeBookingModal
                    isOpen={isChangeBookingModalOpen}
                    onClose={() => setIsChangeBookingModalOpen(false)}
                    bookingData={selectedBooking}
                    onUpdate={refreshBookings}
                />
            )}
        </div>
    );
}
