import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const Confetti = () => {
    // Create more confetti pieces for fuller screen coverage
    const confettiPieces = [...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          y: -10,
          x: 0,
          rotate: 0,
          scale: 0
        }}
        animate={{
          y: [null, Math.random() * window.innerHeight - window.innerHeight/2],
          x: [null, Math.random() * window.innerWidth - window.innerWidth/2],
          rotate: [0, Math.random() * 360],
          scale: [0, 1, 0.5]
        }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeOut"
        }}
        className="fixed w-4 h-4 rounded-sm"
        style={{
          background: ['#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'][Math.floor(Math.random() * 5)],
          top: '50%',
          left: '50%',
          zIndex: 70
        }}
      />
    ));
  
    return <div className="fixed inset-0 pointer-events-none">{confettiPieces}</div>;
  };
  
  const SuccessModal = ({ isOpen, onClose,name }) => {
    if (!isOpen) return null;
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Success Check Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 200,
              damping: 10
            }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-green-500" />
            </motion.div>
  
            {/* Circular Pulse Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{
                border: '2px solid #22c55e',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </motion.div>
  
          {/* Text Animations */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            <motion.span
              animate={{ 
                color: ['#2563eb', '#22c55e', '#2563eb'],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Booking Successful!
            </motion.span>
          </motion.h2>
  
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            Your  {name} has been successfully booked,but is not conform . It wil conform after your payment!
          </motion.p>
  
          {/* Button Animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
  
          {/* Sparkle Effects */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, (i - 1) * 30],
                y: [0, (i - 1) * -30]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                top: '50%',
                left: '50%'
              }}
            />
          ))}
        </motion.div>
        <Confetti />
      </motion.div>
    );
  };
  
  export default SuccessModal;