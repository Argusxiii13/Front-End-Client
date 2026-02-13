'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry: '',
  });
  const [notification, setNotification] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const widgetRef = useRef(null);
  const captchaSolutionRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/friendly-challenge@0.9.12/widget.min.js';
    script.async = true;
    script.defer = true;

    window.doneCallback = (solution) => {
      captchaSolutionRef.current = solution;
    };

    window.errorCallback = () => {};

    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
      delete window.doneCallback;
      delete window.errorCallback;
      document.body.removeChild(script);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initCaptcha = () => {
      const captchaElement = document.getElementById('captcha-widget');
      if (captchaElement && window.FriendlyCaptcha) {
        widgetRef.current = new window.FriendlyCaptcha.WidgetInstance(captchaElement, {
          sitekey: 'FCMGR12NTIE60LB9',
          doneCallback: window.doneCallback,
          errorCallback: window.errorCallback,
        });
      }
    };

    if (window.FriendlyCaptcha) {
      initCaptcha();
    } else {
      window.addEventListener('friendlycaptcha.ready', initCaptcha);
    }

    return () => {
      window.removeEventListener('friendlycaptcha.ready', initCaptcha);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotification('');
    setIsButtonDisabled(true);

    try {
      const solution = captchaSolutionRef.current;

      if (!solution) {
        setNotification('Please complete the captcha verification.');
        setIsSuccess(false);
        setIsButtonDisabled(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaSolution: solution,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification('Thank you! Your message has been sent successfully.');
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', inquiry: '' });

        if (widgetRef.current) {
          widgetRef.current.reset();
          const captchaElement = document.getElementById('captcha-widget');
          if (captchaElement) {
            captchaElement.innerHTML = '';
            widgetRef.current = new window.FriendlyCaptcha.WidgetInstance(captchaElement, {
              sitekey: 'FCMGR12NTIE60LB9',
              doneCallback: window.doneCallback,
              errorCallback: window.errorCallback,
            });
          }
        }
        captchaSolutionRef.current = null;

        notificationTimeoutRef.current = setTimeout(() => {
          setNotification('');
          setIsSuccess(false);
          window.location.reload();
        }, 5000);
      } else {
        setNotification(data.message || 'Failed to send message. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      setNotification('An error occurred while submitting your inquiry.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact" className="flex flex-col md:flex-row items-start justify-between p-8 bg-gradient-to-br from-gray-50 to-gray-100 mt-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/2 p-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-[#4285f4]">AutoConnect Transport</h2>
          <div className="space-y-4">
            <p className="flex items-center text-gray-700">
              <MapPin className="mr-2 text-[#4285f4]" />
              135 San Sebastian, San Isidro, Parañaque, 1700 Metro Manila
            </p>
            <p className="flex items-center text-gray-700">
              <Phone className="mr-2 text-[#4285f4]" /> Globe: 0926-619-3147 / Landlines: 8851 3223
            </p>
            <p className="flex items-center text-gray-700">
              <Mail className="mr-2 text-[#4285f4]" />
              <a href="mailto:otocnct@gmail.com" className="text-[#4285f4] hover:underline">
                otocnct@gmail.com
              </a>
            </p>
          </div>
          <div className="mt-6 rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d965.8323863230764!2d121.00511372268447!3d14.46575672027091!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cf693419e609%3A0x3ed23f42511cd455!2sAutoConnect%20Transport%20Service!5e0!3m2!1sen!2sph!4v1720781616177!5m2!1sen!2sph"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/2 p-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-[#4285f4]">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4] focus:ring-opacity-30 transition-colors"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4] focus:ring-opacity-30 transition-colors"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="block w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4] focus:ring-opacity-30 transition-colors"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="inquiry" className="block text-sm font-medium text-gray-700 mb-1">Inquiry</label>
              <textarea
                id="inquiry"
                name="inquiry"
                rows="5"
                required
                className="block w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4] focus:ring-opacity-30 transition-colors resize-none"
                value={formData.inquiry}
                onChange={handleChange}
              ></textarea>
            </div>
            <div
              id="captcha-widget"
              className="frc-captcha"
              data-sitekey="FCMGR12NTIE60LB9"
              data-callback="doneCallback"
              data-error-callback="errorCallback"
            ></div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#4285f4] hover:bg-[#3367d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285f4] transition-colors"
              disabled={isSubmitting || isButtonDisabled}
            >
              <Send className="mr-2 h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 p-3 rounded-md ${
                  isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {notification}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}