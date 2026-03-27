/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4">You're Invited</h1>
        <p className="text-stone-500">Click the envelope to open your invitation</p>
      </div>

      <div 
        className="relative w-full max-w-sm mx-auto aspect-[2/3] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setIsOpen(true)}
      >
        {/* Envelope Back (Inside) */}
        <div className="absolute inset-0 bg-[#3d111a] rounded-sm shadow-inner" />

        {/* Letter / Card */}
        <motion.div 
          className="absolute left-4 right-4 top-8 bottom-8 bg-white rounded-sm shadow-md p-6 flex flex-col items-center justify-center text-center"
          initial={{ y: 0, zIndex: 10 }}
          animate={
            isOpen 
              ? { y: -250, zIndex: 40, scale: 1.05, rotate: -2 } 
              : { y: 0, zIndex: 10, scale: 1, rotate: 0 }
          }
          transition={{ 
            duration: 0.8, 
            delay: isOpen ? 0.4 : 0,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <Heart className="w-8 h-8 text-rose-400 mb-6" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Save the Date</h2>
          <p className="text-stone-600 font-serif italic mb-8">
            For the wedding celebration of
          </p>
          <div className="text-2xl font-serif text-stone-800 mb-8">
            Bechara & Randa
          </div>
          <div className="text-sm text-stone-400 uppercase tracking-widest border-t border-stone-200 pt-4 w-full">
            September 15, 2026 • New York
          </div>
        </motion.div>

        {/* Envelope Bottom Front Image (Body) */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)' }}
        >
          <img 
            src="/envelope-bottom.png" 
            alt="Envelope Body" 
            className="w-full h-full object-cover drop-shadow-xl"
          />
        </div>

        {/* Envelope Top Flap Image */}
        <motion.div 
          className="absolute inset-0 origin-top"
          initial={{ rotateX: 0, zIndex: 30 }}
          animate={{ 
            rotateX: isOpen ? 180 : 0,
            zIndex: isOpen ? 15 : 30 
          }}
          transition={{ 
            rotateX: { duration: 0.8, ease: "easeInOut" },
            zIndex: { delay: isOpen ? 0.4 : 0.4 }
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of flap (with image) */}
          <div 
            className="absolute inset-0" 
            style={{ 
              backfaceVisibility: 'hidden',
              clipPath: 'polygon(0 0, 100% 0, 50% 52%)'
            }}
          >
            <img 
              src="/envelope-bottom.png" 
              alt="Envelope Top Flap" 
              className="w-full h-full object-cover drop-shadow-xl"
            />
          </div>
          
          {/* Back of flap (inside of envelope) */}
          <div 
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              clipPath: 'polygon(0 100%, 100% 100%, 50% 48%)'
            }}
          >
            {/* Inside flap color */}
            <div className="w-full h-full bg-[#4a1522] rounded-b-sm shadow-inner" />
          </div>
        </motion.div>
      </div>

      {/* Reset Button */}
      <motion.button
        className="mt-24 px-6 py-2 bg-stone-200 text-stone-600 rounded-full hover:bg-stone-300 transition-colors text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
        }}
      >
        Close Envelope
      </motion.button>

      {/* Instructions for user */}
      <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg text-sm text-stone-600 text-center max-w-md mx-auto border border-stone-200">
        <p className="font-medium mb-1">Upload your images to use them:</p>
        <p className="text-stone-500 mb-2">Open the file explorer and upload the images you provided, renaming them to:</p>
        <div className="flex justify-center gap-4 font-mono text-xs bg-stone-100 p-2 rounded">
          <span>envelope-top.png</span>
          <span>envelope-bottom.png</span>
        </div>
      </div>
    </div>
  );
}
