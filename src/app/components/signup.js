'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TermsAndConditionsModal from './termsandcondition'
import PoliciesModal from './PoliciesModal'
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPoliciesModal, setShowPoliciesModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return regex.test(password)
  }

  const handleSendOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;
    
    setIsSendingOtp(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setOtpMessage(errorData.message || 'Failed to send OTP.');
  
        if (errorData.message === 'Email is already registered.') {
          setIsSuccess(false);
        } else {
          setIsSuccess(false);
        }
  
        setTimeout(() => {
          setOtpMessage('');
          setIsSendingOtp(false);
        }, 5000);
        
        return;
      }
  
      setCooldown(120);
      setIsSuccess(true);
      setOtpMessage('Email OTP sent successfully!');
  
      setTimeout(() => {
        setOtpMessage('');
      }, 5000);
  
    } catch (error) {
      setIsSuccess(false);
      setOtpMessage(`Error sending OTP: ${error.message}`);
  
      setTimeout(() => {
        setOtpMessage('');
        setIsSendingOtp(false);
      }, 5000);
    } finally {
      setTimeout(() => {
        setIsSendingOtp(false);
      }, 5000);
    }
  }

  const validateOtp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/validate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        setMessage(errorData.message || 'Invalid OTP.')
        
        setTimeout(() => {
          setMessage('');
        }, 5000);
        
        return false
      }
  
      return true
    } catch (error) {
      setMessage(`Error validating OTP: ${error.message}`)
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
      
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    setMessage('')
    setIsSuccess(false)
  
    if (!validatePassword(password)) {
      setMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.')
      setIsSubmitting(false);
      return
    }
  
    if (!agreeToTerms) {
      setMessage('Please agree to the terms and conditions.')
      setIsSubmitting(false);
      return
    }
  
    const isOtpValid = await validateOtp();
    if (!isOtpValid) {
      setIsSubmitting(false);
      return;
    }
  
    try {
      const userData = JSON.stringify({ name, email, mobileNumber, password })
      console.log('Sending user data:', userData)
  
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: userData,
      })
  
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        console.error('API Error Response:', errorData)
        setMessage(errorData.message || 'An error occurred while creating the user.')
        return
      }
  
      const data = await apiResponse.json()
      console.log('Signup successful:', data)
  
      setMessage('Sign up successful!')
  
      setTimeout(() => {
        setMessage('')
      }, 10000);
  
      setIsSuccess(true)
      setName('')
      setEmail('')
      setMobileNumber('')
      setPassword('')
      setOtp('')
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (error) {
      console.error('Error during signup:', error)
      setMessage(`Error during signup: ${error.message || 'An unexpected error occurred'}`)
      setIsSuccess(false)
    } finally {
      // Reset the submitting state after a delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000); // 3 seconds delay, adjust as needed
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-indigo-100/50 bg-grid-repeat-space-4" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-10"
      >
        <Link href="/">
          <span className="text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
            &larr; Back
          </span>
        </Link>
      </motion.div>

      <div className="flex-grow flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <Image 
                src="/icons/AutoConnect Logo.svg"
                alt="AutoConnect Logo"
                width={450}
                height={82}
                layout="fixed"
              />
            </motion.div>
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            >
              Create your account
            </motion.h2>
          </div>
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`p-4 ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-md`}
            >
              {message}
            </motion.div>
          )}
          {otpMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`p-4 ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-md`}
            >
              {otpMessage}
            </motion.div>
          )}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="mobile-number" className="sr-only">
                  Mobile Number
                </label>
                <input
                  id="mobile-number"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  className="appearance-none rounded-bl-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || isSendingOtp}
                  className="rounded-br-md relative px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  {isSendingOtp ? 'Sending...' : (cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Email OTP')}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </motion.form>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <TermsAndConditionsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PoliciesModal isOpen={showPoliciesModal} onClose={() => setShowPoliciesModal(false)} />
    </div>
  )
}

