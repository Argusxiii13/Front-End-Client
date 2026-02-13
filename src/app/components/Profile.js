'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Home } from 'lucide-react'
import Toast from './animated-toast'
import ChangeBookingModal from './ChangeBookingModal'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phonenumber: '',
    gender: 'Not Set' // Set default value to "Not Set"
  })
  const [profilePictureUrl, setProfilePictureUrl] = useState('/images/profiles/Default.jpg')
  const [errorMessage, setErrorMessage] = useState('')
  const [bookings, setBookings] = useState([])
  const [isChangeBookingModalOpen, setIsChangeBookingModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const fileInputRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  const placeholders = {
    name: 'Enter your full name',
    email: 'Enter your email address',
    phonenumber: 'Enter your phone number',
    gender: 'Select your gender'
  }

  useEffect(() => {
    fetchUserData()
    fetchBookings()
  }, [])

  const fetchUserData = async () => {
    try {
      const userStr = localStorage.getItem('user')
      const user = JSON.parse(userStr)
      if (user && user.id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          // Ensure gender defaults to "Not Set" if fetched value is null or empty
          setUserData({
            ...data,
            gender: data.gender !== null && data.gender !== '' ? data.gender : 'Not Set'
          })

          const pictureResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/profilepicture/${user.id}`)
          if (pictureResponse.ok) {
            const blob = await pictureResponse.blob()
            const url = URL.createObjectURL(blob)
            setProfilePictureUrl(url)
          }
        }
      }
    } catch (error) {
    }
  }

  const fetchBookings = async () => {
    try {
      const userStr = localStorage.getItem('user')
      const user = JSON.parse(userStr)
      if (user && user.id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/user/${user.id}`)
        if (response.ok) {
          const bookingsData = await response.json()
          setBookings(bookingsData)
        }
      }
    } catch (error) {
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'image/jpeg') {
        const previewUrl = URL.createObjectURL(file);
        setProfilePictureUrl(previewUrl);
        setToastMessage('Profile picture selected');
        setToastType('success');
        setShowToast(true);
        handleFileUpload(file);  
      } else {
        setToastMessage('Please select a JPG file only');
        setToastType('error');
        setShowToast(true);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const updatedUserData = {
        ...userData,
        id: user.id,
      };

      const formData = new FormData();
      for (const key in updatedUserData) {
        formData.append(key, updatedUserData[key]);
      }

      const file = fileInputRef.current.files[0];
      if (file) {
        formData.append('userspfp', file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/profile/update/${user.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchUserData();
        setShowToast(false);
        setTimeout(() => {
          setToastMessage('Profile updated successfully');
          setToastType('success');
          setShowToast(true);
        }, 100);
      } else {
        const errorData = await response.json();
        setShowToast(false);
        setTimeout(() => {
          setToastMessage(errorData.message || 'Failed to update profile');
          setToastType('error');
          setShowToast(true);
        }, 100);
      }
    } catch (error) {
      setShowToast(false);
      setTimeout(() => {
        setToastMessage('Error updating profile');
        setToastType('error');
        setShowToast(true);
      }, 100);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'image/jpeg') return;

    const formData = new FormData();
    formData.append('userspfp', file);

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/profile/upload-picture/${user.id}`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
    }
  };

  const renderField = (label, name, type = 'text', isDisabled = false) => {
    return (
      <div className="mb-6 transform transition duration-300 ease-in-out hover:scale-105">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={name}>
          {label}
        </label>
        {isEditing ? (
          <>
            {type === 'select' ? (
              <select
                id={name}
                name={name}
                value={userData[name] || 'Not Set'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              >
                <option value="Not Set">Not Set</option>
                {name === 'gender' && (
                  <>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type={type}
                id={name}
                name={name}
                value={userData[name] || 'Not Set'}
                onChange={handleInputChange}
                placeholder={placeholders[name]}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out ${isDisabled ? 'bg-gray-100' : ''}`}
                disabled={isDisabled}
              />
            )}
          </>
        ) : (
          <p className="text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
            {userData[name] || 'Not set'}
          </p>
        )}
      </div>
    )
  }

  const renderBookings = () => {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setIsChangeBookingModalOpen(true)
                    }}
                  >
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
    {booking.booking_id.toString().padStart(11, '0')}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    {booking.rental_type.charAt(0).toUpperCase() + booking.rental_type.slice(1).toLowerCase()}
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${booking.brand} ${booking.model}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Finished' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Link href="/" className="text-white hover:text-gray-200 flex items-center transition-colors duration-200">
            <Home className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative group" onClick={() => isEditing && fileInputRef.current.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 transition-all duration-300 transform group-hover:scale-105 group-hover:border-blue-400">
                  <Image
                    src={profilePictureUrl}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                    onError={() => setProfilePictureUrl('/images/profiles/Default.jpg')}
                  />
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {userData.name || 'Your Name'}
                </h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>
              <Link
                href="/edit-password"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Edit Password
              </Link>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Full Name', 'name')}
                {renderField('Email', 'email', 'email', true)}
                {renderField('Phone Number', 'phonenumber', 'tel')}
                {renderField('Gender', 'gender', 'select')}
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6">
              
            </div>

            {renderBookings()}
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isChangeBookingModalOpen && (
        <ChangeBookingModal
          isOpen={isChangeBookingModalOpen}
          onClose={() => setIsChangeBookingModalOpen(false)}
          
          bookingData={selectedBooking}
          onUpdate={fetchBookings}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => {
            setShowToast(false);
            setToastMessage('');
            setToastType('success');
          }}
        />
      )}
    </div>
  )
}