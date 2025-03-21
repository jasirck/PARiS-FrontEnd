import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

// Confetti component
const Confetti = ({ count = 50 }) => {
  const randomColor = () => {
    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FDCB6E",
      "#6C5CE7",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const confettiVariants = {
    initial: (i) => ({
      x: Math.random() * 400 - 200,
      y: -100,
      opacity: 1,
      rotate: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
    }),
    animate: (i) => ({
      x: Math.random() * 400 - 200,
      y: window.innerHeight + 100,
      opacity: 0,
      rotate: Math.random() * 360,
      transition: {
        duration: Math.random() * 3 + 2,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="initial"
          animate="animate"
          variants={confettiVariants}
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            width: "10px",
            height: "10px",
            backgroundColor: randomColor(),
            borderRadius: "50%",
            zIndex: 10,
          }}
        />
      ))}
    </>
  );
};

export function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get("session_id");

    setData('sessionId', sessionId,'token', token);
    

    if (sessionId) {
      axios
        .post(
          "https://api.paristoursandtravels.in/api/confirm-payment/",
          { session_id: sessionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setBookingId(response.data.booking_id);
          setPaymentStatus("Payment successful, your booking is confirmed!");
          console.log(response.data);
          setData({'amount': response.data.amount,'name': response.data.name});
        })
        .catch((error) => {
          setPaymentStatus("Payment failed. Please try again.");
        });
    }
  }, [token]);

  // Tick mark path animation variants
  const tickVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
  };

  // Celebration animation variants
  const celebrateVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -10 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: [0, 10, -10, 0],
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F6F6] to-[#E0E7FF] overflow-hidden">
      {/* Confetti Background */}
      <Confetti count={70} />

      {/* Main Content */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={celebrateVariants}
        className="relative z-20 bg-white p-10 rounded-2xl shadow-2xl text-center max-w-lg mx-auto transform transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Success Icon */}
        <motion.svg
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
          }}
          className="w-32 h-32 text-[#4CAF50] mx-auto mb-6 drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: {
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            fill="none"
          />
        </motion.svg>

        {/* Celebratory Title */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              type: "spring",
            },
          }}
          className="text-4xl font-bold text-[#1A237E] mb-4 tracking-tight"
        >
          Hurray! 🎉
        </motion.h2>

        {/* Payment Details */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              delay: 0.2,
            },
          }}
          className="text-xl mb-6 text-[#37474F]"
        >
          You have successfully paid{" "}
          <span className="font-bold text-[#4CAF50]">₹{data?.amount}</span> for{" "}
          <strong className="text-[#1A237E]">{data?.name}</strong>.
        </motion.p>

        {/* Payment Status */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.6,
              delay: 0.4,
            },
          }}
          className="text-[#37474F] mb-4 italic"
        >
          {paymentStatus}
        </motion.p>

        {/* Booking ID */}
        {bookingId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.6,
                delay: 0.6,
              },
            }}
            className="text-[#1A237E] mb-6 font-semibold"
          >
            Booking ID: {bookingId}
          </motion.p>
        )}

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.6,
              delay: 0.8,
            },
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-3)}
          className="px-8 py-3 text-white bg-[#4CAF50] rounded-lg 
          hover:bg-[#45a049] transition-all duration-300 
          transform hover:shadow-lg active:scale-95 
          text-lg font-semibold tracking-wide"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}

export function PaymentCancel() {
  const navigate = useNavigate();

  // Cross icon animation variants
  const crossVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [1, 1.1, 1], 
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  };

  // Content animation variants
  const contentVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -10 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: [0, 10, -10, 0],
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5
      }
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F6F6F6]">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={contentVariants}
        className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-lg mx-auto"
      >
        {/* Failure Icon */}
        <motion.svg
          initial="initial"
          animate="animate"
          variants={crossVariants}
          className="w-32 h-32 text-[#FF4136] mx-auto mb-6 drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              transition: {
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
            stroke="currentColor"
            fill="none"
          />
        </motion.svg>

        {/* Failure Title */}
        <motion.h2 
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6, 
              type: "spring" 
            }
          }}
          className="text-3xl font-semibold text-[#023246] mb-4"
        >
          Payment Cancelled
        </motion.h2>

        {/* Payment Details */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6, 
              delay: 0.2 
            }
          }}
          className="text-xl mb-6 text-[#023246]"
        >
          Your payment for this transaction has been cancelled.
        </motion.p>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.6, 
              delay: 0.8 
            }
          }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-2)}
          className="px-6 py-2 text-white bg-[#287094] rounded-md hover:bg-[#023246] transition-colors duration-300"
        >
          Go back
        </motion.button>
      </motion.div>
    </div>
  );
}




// PaymentResult.RefundSuccess.jsx
const RefundSuccess = ({ refundData, onClose }) => {
  const navigate = useNavigate();
  const [refundStatus, setRefundStatus] = useState("Refund successful!");
  const [amount, setAmount] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    if (refundData) {
      setAmount(`₹${refundData.refund_amount}`);
      setTransactionId(refundData.stripe_refund_id);
    }
  }, [refundData]);

  // Celebration animation variants
  const celebrateVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -10 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: [0, 10, -10, 0],
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Confetti Background */}
      <Confetti count={70} />

      {/* Main Content */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={celebrateVariants}
        className="relative z-20 bg-white p-10 rounded-2xl shadow-2xl text-center max-w-lg mx-auto transform transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Success Icon */}
        <motion.svg
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
          }}
          className="w-32 h-32 text-[#4CAF50] mx-auto mb-6 drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: {
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            fill="none"
          />
        </motion.svg>

        {/* Success Title */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              type: "spring",
            },
          }}
          className="text-4xl font-bold text-[#1A237E] mb-4 tracking-tight"
        >
          Refund Complete! 🎉
        </motion.h2>

        {/* Refund Details */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              delay: 0.2,
            },
          }}
          className="text-xl mb-6 text-[#37474F]"
        >
          You have been refunded{" "}
          <span className="font-bold text-[#4CAF50]">{amount}</span> for your
          recent transaction.
        </motion.p>

        {/* Refund Status */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.6,
              delay: 0.4,
            },
          }}
          className="text-[#37474F] mb-4 italic"
        >
          {refundStatus}
        </motion.p>

        {/* Transaction ID */}
        {transactionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.6,
                delay: 0.6,
              },
            }}
            className="text-[#1A237E] mb-6 font-semibold"
          >
            Transaction ID: {transactionId}
          </motion.p>
        )}

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.6,
              delay: 0.8,
            },
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onClose(); // Close the modal
            navigate("/"); // Navigate to home
          }}
          className="px-8 py-3 text-white bg-[#4CAF50] rounded-lg 
          hover:bg-[#45a049] transition-all duration-300 
          transform hover:shadow-lg active:scale-95 
          text-lg font-semibold tracking-wide"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RefundSuccess;