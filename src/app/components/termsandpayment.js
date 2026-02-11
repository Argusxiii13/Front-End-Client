'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const PAYMENT_METHODS = {
  bpi: {
    name: 'BPI',
    imageSrc: '/images/payments/BPI_otocnct.png',
  },
  gcash: {
    name: 'GCash',
    imageSrc: '/images/payments/GCASH_otocnct.png',
  },
  maya: {
    name: 'Maya',
    imageSrc: '/images/payments/Maya_otocnct.png',
  }
}

export default function Component({ 
  isOpen, 
  onClose,
  amount = 5000,
  bookingId = '',
  paymentAccounts = {},
  onPaymentComplete = async () => {},
  isProcessing = false,
  error = '',
}) {
  const [showPayment, setShowPayment] = useState(false)
  const [activeTab, setActiveTab] = useState('bpi')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    setShowPayment(true)
  }

  const handleBack = () => {
    setShowPayment(false)
  }

  const handlePaymentComplete = async () => {
    try {
      setIsSubmitting(true)
      await onPaymentComplete({
        bookingId,
        paymentMethod: activeTab,
        amount,
        timestamp: new Date().toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Payment completion failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold">
            {showPayment ? 'AutoConnect Payment Channels' : 'AutoConnect Transport Rental Terms and Conditions'}
          </h2>
        </div>
        <div className="overflow-auto h-[60vh] sm:h-[70vh]">
          <div className="p-4 sm:p-6">
            {!showPayment ? (
              <ol className="list-decimal pl-5 space-y-4 text-sm sm:text-base">
                {/* Terms and conditions content - keeping exactly the same */}
                <li>
                  <strong>PAYMENT TERMS:</strong>
                  <ul className="list-disc pl-5">
                    <li>Accepted payment methods:
                      <ul className="list-disc pl-5">
                        <li>Cash</li>
                        <li>Bank Deposits</li>
                        <li>Money Transfer</li>
                        <li>Gcash</li>
                        <li>Maya Bank</li>
                        <li>QRPh</li>
                        <li>PayMaya</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>CANCELLATION POLICY:</strong>
                  <ul className="list-disc pl-5">
                    <li>Cancellations made less than 7 days before the rental date incur a 20% cancellation fee.</li>
                    <li>Cancellations made one (1) day before the rental date incur a 50% cancellation fee.</li>
                    <li>Cancellations on the rental day or no-shows incur a 100% cancellation fee.</li>
                  </ul>
                </li>
                <li>
                  <strong>RENTAL HOURS (Chauffeur Driven Only):</strong>
                  <ul className="list-disc pl-5">
                    <li>Rental begins at the Renter's specified reporting time.</li>
                    <li>Drop-off/Pick-up: The Renter will be driven to the agreed destination. Additional trips or waiting times require prior approval from AutoConnect Transport and may incur extra charges.</li>
                  </ul>
                </li>
                <li>
                  <strong>USAGE RESTRICTIONS:</strong>
                  <ul className="list-disc pl-5">
                    <li>The rented vehicle must not be used:
                      <ul className="list-disc pl-5">
                        <li>Off-road, mountainous trails, or areas unsuitable for cars or vans, or taken off Luzon Island.</li>
                        <li>For high-speed, reckless, or negligent driving that could cause accidents or vehicle damage.</li>
                        <li>To carry passengers, goods, or items with strong odors that could stain or damage the vehicle.</li>
                        <li>For illegal activities, customs violations, or any purpose deemed inappropriate by AutoConnect Transport.</li>
                      </ul>
                    </li>
                    <li>The vehicle can only be driven by the AutoConnect-approved chauffeur or a driver listed in the agreement, unless otherwise authorized in writing by AutoConnect Transport.</li>
                  </ul>
                </li>
                <li>
                  <strong>EXTENSION OF RENTAL:</strong>
                  <ul className="list-disc pl-5">
                    <li>If the Renter wishes to extend the rental period, AutoConnect Transport must be notified immediately. Failure to do so may be considered a violation of this agreement.</li>
                  </ul>
                </li>
                <li>
                  <strong>LIABILITY AND MECHANICAL FAILURE:</strong>
                  <ul className="list-disc pl-5">
                    <li>AutoConnect Transport is not liable for mechanical failures or consequential delays. The Renter is responsible for any damages resulting from negligence.</li>
                  </ul>
                </li>
                <li>
                  <strong>INSURANCE COVERAGE:</strong>
                  <ul className="list-disc pl-5">
                    <li>AutoConnect Transport vehicles carry insurance covering driver liability for injuries and property damage, providing coverage up to PHP 50,000 per passenger, up to the maximum capacity of the vehicle.</li>
                  </ul>
                </li>
                <li>
                  <strong>ACCIDENTS AND DAMAGES:</strong>
                  <ul className="list-disc pl-5">
                    <li>In case of an accident, the Renter should notify AutoConnect Transport immediately. The Renter is responsible for repair costs and any vehicle downtime.</li>
                    <li>The Renter is liable for a participation fee and towing costs in the event of an accident. Coverage may be limited based on the insurance policy.</li>
                  </ul>
                </li>
                </ol>
            ) : (
              <div className="space-y-6 text-center">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold">Total Amount Due:</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">₱{amount.toFixed(2)}</p>
                </div>
                <p className="font-bold text-base sm:text-lg">Please pay the exact amount</p>
                <p className="text-red-500 text-base sm:text-lg">Warning: If payment is not settled or not sure within 24 hours, the booking will be considered cancelled.</p>
                <p className="text-base sm:text-lg">If you have completed the payment, please press the Done button below.</p>
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <div className="w-full">
                  <div className="flex border-b">
                    {Object.keys(PAYMENT_METHODS).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${
                          activeTab === tab
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {PAYMENT_METHODS[tab].name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <PaymentOption
                      imageSrc={PAYMENT_METHODS[activeTab].imageSrc}
                      altText={`${PAYMENT_METHODS[activeTab].name} Payment QR Code`}
                      accountName="AutoConnect Transport"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          {showPayment && (
            <button
              onClick={handleBack}
              disabled={isSubmitting || isProcessing}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={showPayment ? handlePaymentComplete : handleNext}
            disabled={isSubmitting || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ml-auto disabled:opacity-50"
          >
            {isSubmitting || isProcessing ? 'Processing...' : showPayment ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentOption({ imageSrc, altText, accountName }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Image src={imageSrc} alt={altText} width={500} height={500} className="max-w-full h-auto" />
      <div className="text-middle w-full">
        <p><strong>Account Name:</strong> {accountName}</p>
      </div>
      <button
        onClick={() => window.open(imageSrc, '_blank')}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  )
}