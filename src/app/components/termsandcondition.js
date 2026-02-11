'use client';

import React from 'react';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-md shadow-md max-w-lg w-full overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">AutoConnect Transport Rental Terms and Conditions</h2>
          <div className="max-h-[60vh] overflow-y-auto border border-gray-300 rounded-md p-4 text-justify">
            <h3 className="font-semibold">Last Updated: 10/09/2024</h3>
            <ol className="list-decimal pl-5">
              <li>
                <strong>PAYMENT TERMS:</strong>
                <p>Accepted payment methods:</p>
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
                <p className="text-justify">The rented vehicle must not be used:</p>
                <ul className="list-disc pl-5">
                  <li>Off-road, mountainous trails, or areas unsuitable for cars or vans, or taken off Luzon Island.</li>
                  <li>For high-speed, reckless, or negligent driving that could cause accidents or vehicle damage.</li>
                  <li>To carry passengers, goods, or items with strong odors that could stain or damage the vehicle.</li>
                  <li>For illegal activities, customs violations, or any purpose deemed inappropriate by AutoConnect Transport.</li>
                </ul>
                <p className="text-justify">The vehicle can only be driven by the AutoConnect-approved chauffeur or a driver listed in the agreement, unless otherwise authorized in writing by AutoConnect Transport.</p>
              </li>
              <li>
                <strong>EXTENSION OF RENTAL:</strong>
                <p className="text-justify">If the Renter wishes to extend the rental period, AutoConnect Transport must be notified immediately. Failure to do so may be considered a violation of this agreement.</p>
              </li>
              <li>
                <strong>LIABILITY AND MECHANICAL FAILURE:</strong>
                <p className="text-justify">AutoConnect Transport is not liable for mechanical failures or consequential delays. The Renter is responsible for any damages resulting from negligence.</p>
              </li>
              <li>
                <strong>INSURANCE COVERAGE:</strong>
                <p className="text-justify">AutoConnect Transport vehicles carry insurance covering driver liability for injuries and property damage, providing coverage up to PHP 50,000 per passenger, up to the maximum capacity of the vehicle.</p>
              </li>
              <li>
                <strong>ACCIDENTS AND DAMAGES:</strong>
                <ul className="list-disc pl-5">
                  <li>In case of an accident, the Renter should notify AutoConnect Transport immediately. The Renter is responsible for repair costs and any vehicle downtime.</li>
                  <li>The Renter is liable for a participation fee and towing costs in the event of an accident. Coverage may be limited based on the insurance policy.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
        <div className="p-4 bg-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

