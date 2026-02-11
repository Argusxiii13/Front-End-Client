'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, user_id, booking_id, bookingDetails }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null); // Store user data

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  if (!isOpen) return null;
  if (!user) {
    alert("User not logged in. Please log in to provide feedback.");
    return null;
  }

  const handleSubmit = async () => {
    // Validate input fields
    if (rating === 0) {
      alert("Please provide a rating.");
      return;
    }
    if (!booking_id) {
      alert("Booking ID is required.");
      return;
    }
    if (feedback.trim() === '') {
      alert("Please provide feedback.");
      return;
    }

    const feedbackData = {
      user_id: user_id,
      car_id: bookingDetails.car_id, // Use car ID from bookingDetails
      booking_id: booking_id, // Include the booking ID
      rating,
      description: feedback,
    };

    console.log("Sending feedback data:", feedbackData);

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to submit feedback');
      }

      const result = await response.json();
      console.log(result.message);

      // Reset form
      setRating(0);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert("There was an error submitting your feedback: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Rate Your Experience</h2>
          <div className="space-y-4">
            <div className="flex justify-center space-x-2" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${
                    star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setRating(star);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
            <textarea
              placeholder="Please share your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Feedback"
            />
          </div>
        </div>
        <div className="bg-gray-100 px-6 py-4 flex justify-between rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}