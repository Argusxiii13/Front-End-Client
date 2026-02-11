'use client';

import Image from 'next/image';
import { FaPhone, FaEnvelope, FaFacebook, FaMapLocation } from 'react-icons/fa6';
import Copyright from './Copyright';
import { motion } from 'framer-motion';
import { fadeIn } from '/variants';
import { Link } from 'react-scroll';
import { useState } from 'react';
import TermsAndConditionsModal from './termsandcondition';
import PoliciesModal from './PoliciesModal';

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  return (
    <footer className='pt-20 bg-white z-20' id='contact'>
      <div className='container mx-auto mb-24'>
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.6 }}
          className='flex flex-col lg:flex-row lg:justify-between gap-x-5 gap-y-14'
        >
          <div className='flex flex-col flex-1 gap-y-8'>
            <Link
              to={'home'}
              smooth={true}
              spy={true}
              className='cursor-pointer'
            >
              <Image src={'/icons/AutoConnect Trans.svg'} width={250} height={200} alt='AutoConnect Transport Logo' />
            </Link>
            <div className='flex items-center gap-x-[10px]'>
              <FaMapLocation size={35} />
              <div className='font-medium'>135 San Sebastian, San Isidro, Parañaque, 1700 Metro Manila</div>
            </div>
            <div className='flex flex-col gap-y-4 font-semibold'>
              <div className='flex items-center gap-x-[10px]'>
                <FaPhone />
                <div className='font-medium'>8851 3223</div>
              </div>
              <div className='flex items-center gap-x-[10px]'>
                <FaEnvelope />
                <div className='font-medium'>autoconnecttransport@gmail.com</div>
              </div>
            </div>
          </div>
          <div className='flex-1 flex flex-col xl:items-center'>
            <div>
              <h3 className='h3 font-bold mb-8'>Company</h3>
              <ul className='flex flex-col gap-y-4 font-semibold'>
                <li>
                  <button onClick={() => setIsPoliciesOpen(true)} className="hover:text-primary transition-colors">Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => setIsTermsOpen(true)} className="hover:text-primary transition-colors">Terms & Conditions</button>
                </li>
              </ul>
            </div>
          </div>
          <div className='flex-1'>
            <h3 className='h3 font-bold mb-8'>Working Hours</h3>
            <div className='flex flex-col gap-y-4'>
              <div className='flex gap-x-2'>
                <div className='text-secondary'>Mon-Fri:</div>
                <div className='font-semibold'>09:00AM - 09:00PM</div>
              </div>
              <div className='flex gap-x-2'>
                <div className='text-secondary'>Sat-Sun:</div>
                <div className='font-semibold'>09:00AM - 07:00PM</div>
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <h3 className='h3 font-bold mb-8'>Follow Us</h3>
            <div className='flex items-center gap-x-4'>
              <a 
                href='https://www.facebook.com/autoconnecttransport' 
                target='_blank' 
                rel='noopener noreferrer'
                className="hover:opacity-80 transition-opacity"
              >
                <FaFacebook className='text-blue-600' size={24} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
      <Copyright />
      
      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />
      {/* Privacy Policy Modal */}
      <PoliciesModal 
        isOpen={isPoliciesOpen} 
        onClose={() => setIsPoliciesOpen(false)} 
      />
    </footer>
  );
}