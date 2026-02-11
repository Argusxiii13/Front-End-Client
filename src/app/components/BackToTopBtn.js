'use client';

import React, { useEffect, useState } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-scroll';

export default function BackToTopBtn() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // clean up the event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Added empty dependency array to avoid unnecessary re-runs

  return (
    <Link
      to='home'
      smooth={true}
      className={`${
        !isActive && 'hidden'
      } fixed bg-accent hover:bg-accent-hover w-12 h-12 right-8 bottom-11 z-10 cursor-pointer flex justify-center items-center text-white border-2 border-white`}
    >
      <FaChevronUp className='text-xl' />
    </Link>
  );
}