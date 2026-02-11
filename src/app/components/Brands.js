'use client';

// image
import Image from 'next/image';

// framer
import { motion } from 'framer-motion';

// variants
import { fadeIn } from '/variants';

export default function Brands() {
  return (
    <section className='xl:pt-16 xl:h-[200px] bg-white flex flex-col justify-center'>
      <motion.div
        variants={fadeIn('up', 0.4)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.6 }}
        className='container mx-auto'
      >
        {/* brand wrapper */}
        <div className='grid grid-cols-3 gap-6 place-items-center xl:flex xl:flex-wrap xl:gap-x-6 xl:justify-between'>
          <div>
            <Image
              src={'icons/brands/toyota.svg'}
              width={85}
              height={32}
              alt=''
            />
          </div>
          <div>
            <Image
              src={'icons/brands/honda.svg'}
              width={85}
              height={32}
              alt=''
            />
          </div>
          <div>
            <Image src={'icons/brands/hyundai.svg'} width={85} height={32} alt='' />
          </div>
          <div>
            <Image src={'icons/brands/mitsubishi.svg'} width={85} height={32} alt='' />
          </div>
          <div>
            <Image
              src={'icons/brands/nissan.svg'}
              width={85}
              height={32}
              alt=''
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
