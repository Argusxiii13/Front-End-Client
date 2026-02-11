'use client';

import React from 'react';

export default function PoliciesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-md shadow-md max-w-lg w-full overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">AutoConnect Transport Privacy Policy</h2>
          <div className="max-h-[60vh] overflow-y-auto border border-gray-300 rounded-md p-4 text-justify">
            <h3 className="font-semibold">Last Updated: 12/12/2024</h3>
            <ol className="list-decimal pl-5">
              <li><strong>Introduction:</strong> AutoConnect Transport ("we," "our," or "us") is committed to protecting the privacy of our customers. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our services or visit our website.</li>
              <li>
                <strong>Information We Collect:</strong>
                <ul>
                  <li>
                    <strong>Personal Information:</strong>
                    <ul>
                      <li>Name</li>
                      <li>Address</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Vehicle preferences</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <strong>How We Use Your Information:</strong>
                <ul>
                  <li>To provide and manage our car rental services</li>
                  <li>To communicate with you about your rentals and our services</li>
                  <li>To improve our services and develop new features</li>
                  <li>To comply with legal obligations</li>
                  <li>We may email or contact you regarding your bookings, inquiries, and other related matters.</li>
                </ul>
              </li>
              <li>
                <strong>Payment Processing:</strong>
                <p className="text-justify">We use third-party payment processors to handle financial transactions. When you make a payment, you may be providing personal and financial information directly to the third-party processor. The use of your information by these processors is governed by their respective privacy policies. We recommend reviewing their policies to understand how they handle your data.</p>
              </li>
              <li>
                <strong>Analytics:</strong>
                <p className="text-justify">We use analytics services to monitor and analyze the use of our service. These tools collect information sent by your device or our service, including the web pages you visit, add-ons, and other information that assists us in improving our service. This analytics information is collected and used in aggregate form.</p>
              </li>
              <li>
                <strong>Information Sharing and Disclosure:</strong>
                <p className="text-justify">We may share your information with:</p>
                <ul>
                  <li>Service providers who assist in our business operations</li>
                  <li>Law enforcement or government agencies when required by law</li>
                </ul>
                <p className="text-justify">We do not sell your personal information to third parties.</p>
              </li>
              <li>
                <strong>Data Security:</strong>
                <p className="text-justify">We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.</p>
              </li>
              <li>
                <strong>Your Data Protection Rights:</strong>
                <p className="text-justify">Depending on your location, you may have the following rights:</p>
                <ul>
                  <li>Access: You can request copies of your personal information.</li>
                  <li>Rectification: You can request that we correct any information you believe is inaccurate.</li>
                  <li>Erasure: You can request that we erase your personal information, under certain conditions.</li>
                  <li>Restrict processing: You can request that we restrict the processing of your personal information, under certain conditions.</li>
                  <li>Object to processing: You can object to our processing of your personal information, under certain conditions.</li>
                  <li>Data portability: You can request that we transfer the data we've collected to another organization, or directly to you, under certain conditions.</li>
                </ul>
                <p className="text-justify">If you make a request, we have one month to respond to you. To exercise these rights, please contact us using the information provided in Section 12.</p>
              </li>
              <li>
                <strong>Disclosure of Data:</strong>
                <p className="text-justify">We may disclose your personal data in the good faith belief that such action is necessary to:</p>
                <ul>
                  <li>Comply with a legal obligation</li>
                  <li>Protect and defend the rights or property of AutoConnect Transport</li>
                  <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                  <li>Protect the personal safety of users of the Service or the public</li>
                  <li>Protect against legal liability</li>
                </ul>
              </li>
              <li>
                <strong>Limitation of Responsibility for User Device Security:</strong>
                <p className="text-justify">While we implement reasonable measures to safeguard your personal information, the security of your personal devices (such as smartphones, tablets, computers, and email accounts) remains your responsibility. We are not liable for any unauthorized access, theft, or disclosure of information resulting from a lack of adequate security measures on your personal devices. We recommend enabling strong passwords, multi-factor authentication, and other security features to protect your devices and accounts.</p>
              </li>
              <li>
                <strong>Changes to This Privacy Policy:</strong>
                <p className="text-justify">We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
              </li>
              <li>
                <strong>Contact Us:</strong>
                <p className="text-justify">If you have any questions about this Privacy Policy, please contact us at:</p>
                <p className="text-justify">autoconnecttransport@gmail.com</p>
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
