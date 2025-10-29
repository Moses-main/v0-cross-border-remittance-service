'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useEffect, useState } from 'react';

export function PageLoader({ isLoading }: { isLoading: boolean }) {
  const [showLoader, setShowLoader] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle loading state with a small delay to prevent flickering
  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setShowLoader(true);
    } else {
      // Start fade out animation
      setIsVisible(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => setShowLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/30 backdrop-blur-sm pointer-events-none"
        >
          <div className="relative">
            <motion.div 
              className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-primary/20"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0px rgba(99, 102, 241, 0.1)',
                  '0 0 0 10px rgba(99, 102, 241, 0.1)',
                  '0 0 0 20px rgba(99, 102, 241, 0)'
                ]
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }
              }}
            >
              <OptimizedImage
                src="/betaRemit.png"
                alt="Loading"
                width={80}
                height={80}
                imgClassName="object-cover w-full h-full"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
