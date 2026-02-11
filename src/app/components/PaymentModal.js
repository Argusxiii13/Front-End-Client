import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Upload } from 'lucide-react';
import Toast from './animated-toast';

const PAYMENT_METHODS = {
  bpi: {
    name: 'BPI',
    imageSrc: '/images/payments/BPI_otocnct.png',
    accountName: 'AutoConnect Transport'
  },
  gcash: {
    name: 'GCash',
    imageSrc: '/images/payments/GCASH_otocnct.png',
    accountName: 'AutoConnect Transport'
  },
  maya: {
    name: 'Maya',
    imageSrc: '/images/payments/Maya_otocnct.png',
    accountName: 'AutoConnect Transport'
  }
};

export default function PaymentModal({ isOpen, onClose, booking_id, user_id }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('bpi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    booking_id: '',
    isProcessing: true,
    error: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const scrollRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          setUser(JSON.parse(userStr));
      }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/jpeg') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setPaymentData(prev => ({ ...prev, error: '' }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        error: 'Please select a JPG file'
      }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPaymentData(prev => ({ ...prev, error: '' }));
  };

  const handleNext = () => {
    setShowPayment(true);
    setPaymentData(prev => ({ ...prev, error: '' }));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const handleBack = () => {
    setShowPayment(false);
    setPaymentData(prev => ({ ...prev, error: '' }));
  };

  useEffect(() => {
    if (!isOpen) {
      setPaymentData({
        amount: 0,
        booking_id: '',
        isProcessing: false,
        error: ''
      });
      return;
    }

    const fetchPaymentData = async () => {
      setPaymentData(prev => ({ ...prev, isProcessing: true }));
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/${booking_id}`);
        if (!response.ok) {
          throw new Error('Failed to load booking details');
        }
        const data = await response.json();
        const amount = data.price || data.amount || 0;

        setPaymentData({
          amount: amount,
          booking_id: data.booking_id || booking_id,
          isProcessing: false,
          error: ''
        });
      } catch (error) {
        setPaymentData(prev => ({
          ...prev,
          isProcessing: false,
          error: error.message || 'Failed to load payment details',
          amount: 0
        }));
      }
    };

    fetchPaymentData();
  }, [isOpen, booking_id]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowPayment(false);
      setPaymentData(prev => ({ ...prev, error: '' }));
    }
  }, [isOpen]);




  const handlePaymentComplete = async () => {
    if (!selectedFile) {
      setPaymentData(prev => ({
        ...prev,
        error: 'Please attach your payment proof'
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      formData.append('booking_id', booking_id);
      formData.append('user_id', user_id);
      formData.append('clientEmail', user.email);
      

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/upload-receipt/${paymentData.booking_id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Receipt upload failed. Please ensure you are uploading a JPG file.');
      }

      setIsLoading(true);
      setToastMessage('Payment receipt sent');
      setToastType('success');
      setShowToast(true);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 5000);

    } catch (error) {
      setPaymentData(prev => ({
        ...prev,
        error: error.message || 'Payment completion failed'
      }));
      setToastMessage('Receipt upload failed');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PaymentQRCode = ({ method }) => (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-500 h-500 relative">
        <img
          src={PAYMENT_METHODS[method].imageSrc}
          alt={`${PAYMENT_METHODS[method].name} QR Code`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="font-medium">Account Name:</p>
        <p>{PAYMENT_METHODS[method].accountName}</p>
      </div>
      <button
        onClick={() => window.open(PAYMENT_METHODS[method].imageSrc, '_blank')}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg">
        <div className="p-6 space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {showPayment ? 'Payment Details' : 'AutoConnect Transport Rental Terms and Conditions'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto p-6">
          {!showPayment ? (
            <ol className="list-decimal pl-5 space-y-4 text-sm sm:text-base">
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
            paymentData.error ? (
              <div className="text-red-500 text-center py-4">
                {paymentData.error}
              </div>
            ) : paymentData.isProcessing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Processing your payment...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Amount Due:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₱{(typeof paymentData.amount === 'number' && !isNaN(paymentData.amount) && paymentData.amount > 0) 
                        ? paymentData.amount.toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) 
                        : 'N/A'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex border-b">
                    {Object.keys(PAYMENT_METHODS).map((method) => (
                      <button
                        key={method}
                        onClick={() => setActiveTab(method)}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${
                          activeTab === method
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {PAYMENT_METHODS[method].name}
                      </button>
                    ))}
                  </div>

                  <PaymentQRCode method={activeTab} />
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="space-y-4">
                      <label className="block text-center">
                        <span className="text-gray-700">Upload Payment Proof</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg"
                          onChange={handleFileSelect}
                        />
                        {!previewUrl && (
                          <div className="mt-2 flex flex-col items-center space-y-2">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                              onClick={() => document.querySelector('input[type=file]').click()}
                            >
                              Select Image
                            </button>
                            <p className="text-sm text-gray-500">
                              Upload JPG only (Max 5MB)
                            </p>
                          </div>
                        )}
                      </label>

                      {previewUrl && (
                        <div className="relative">
                          <img src={previewUrl}
                            alt="Payment proof preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-center text-red-500">
                    Warning: Booking will be cancelled if payment is not completed within 24 hours.
                  </p>

                  <button
                    onClick={handlePaymentComplete}
                    disabled={isSubmitting || !selectedFile}
                    className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          {showPayment && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}
          {!showPayment && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ml-auto"
            >
              Next
            </button>
          )}
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}