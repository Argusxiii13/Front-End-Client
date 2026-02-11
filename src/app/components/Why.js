'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeIn } from '/variants';
import { MdCalendarToday, MdCarRental, MdHandshake, MdKey, MdMyLocation, MdTrendingUp } from 'react-icons/md';

export default function Why() {
  return (
    <section className='section flex items-center pb-12 md:pb-4' id='why'>
      <div className='container mx-auto'>
        <motion.h2
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.6 }}
          className='h2 text-center'
        >
          Rent in 3 Easy Steps
        </motion.h2>
        <motion.p
          variants={fadeIn('up', 0.4)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.6 }}
          className='max-w-[680px] text-center mx-auto mb-6'
        >
          Our dedication to providing exceptional services sets us apart from
          the competition. From the moment you engage with us, we strive to
          exceed your expectations in every interaction.
        </motion.p>
        {/* car image */}
        <motion.div
          variants={fadeIn('up', 0.6)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.6 }}
          className='flex justify-center mb-6 xl:mb-2'
        >
          <Image 
            src={'/images/why/showcase.svg'} 
            width={500} 
            height={320} 
            alt='Car showcase'
            className='w-full max-w-[300px] md:max-w-[500px] h-auto'
          />
        </motion.div>
        {/* grid items */}
        <motion.div
          variants={fadeIn('up', 0.8)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.4 }}
          className='flex flex-wrap justify-center xl:grid xl:grid-cols-3 gap-6 xl:gap-y-0 xl:gap-x-[30px] mb-8 md:mb-0'
        >
          {/* item 1 */}
          <div className='flex flex-col items-center text-center max-w-[160px] xl:max-w-none p-2 xl:p-0'>
            <MdMyLocation className='text-[38px] text-accent mb-4' />
            <h3 className='h3'>Choose Location</h3>
            <p className='hidden xl:flex'>
              Choose your location and find your suitable car.
            </p>
          </div>
          {/* item 2 */}
          <div className='flex flex-col items-center text-center max-w-[160px] xl:max-w-none p-2 xl:p-0'>
            <MdCalendarToday className='text-[38px] text-accent mb-4' />
            <h3 className='h3'>Pick-up date</h3>
            <p className='hidden xl:flex'>
              Select your pick up date and time to book your car.
            </p>
          </div>
          {/* item 3 */}
          <div className='flex flex-col items-center text-center max-w-[160px] xl:max-w-none p-2 xl:p-0 mb-8 xl:mb-0'>
            <MdCarRental className='text-[38px] text-accent mb-4' />
            <h3 className='h3'>Book your car</h3>
            <p className='hidden xl:flex'>
              Reserve your car with us, and enjoy our rental package that includes a chauffeur service.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}