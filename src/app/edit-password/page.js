'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import Toast from '../components/animated-toast'

export default function EditPassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const router = useRouter()

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePassword(newPassword)) {
      setErrorMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.")
      return
    }

    try {
      const userStr = localStorage.getItem('user')
      const user = JSON.parse(userStr)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/profile/change-password/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setToastMessage('Password updated successfully')
        setToastType('success')
        setShowToast(true)
        setTimeout(() => {
          router.push('/profile')
        }, 2000)
      } else {
        const data = await response.json()
        setToastMessage(data.message || 'Failed to update password')
        setToastType('error')
        setShowToast(true)
      }
    } catch (error) {
      console.error('Error updating password:', error)
      setToastMessage('Error updating password')
      setToastType('error')
      setShowToast(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Password</h1>
          <Link href="/profile" className="text-white hover:text-gray-200 flex items-center transition-colors duration-200">
            <Home className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Back to Profile</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                  required
                />
              </div>
              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => {
            setShowToast(false)
            setToastMessage('')
            setToastType('success')
          }}
        />
      )}
    </div>
  )
}

