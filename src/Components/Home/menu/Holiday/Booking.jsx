

import React, { useEffect, useState } from "react";
import axios from "../../../../utils/Api";
import { motion } from "framer-motion";
import { Calendar } from "@nextui-org/react";
import { Check } from "lucide-react";
import { toast } from 'sonner';
import { today, parseDate, getLocalTimeZone } from "@internationalized/date";

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

const SuccessModal = ({ isOpen, onClose }) => {
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
          Your holiday package{name} has been successfully booked,but is not conform . It wil conform after your payment!
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
      {/* Fullscreen Confetti */}
      <Confetti />
    </motion.div>
  );
};

// Main Booking Modal Component
export default function BookingModal({
  handleBookingModal,
  isModalOpen,
  data,
  setIsModalOpen,
}) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { id, name, start, end, base_price, adult_price, child_price } = data;

  useEffect(() => {
    setTotalAmount(adult_price * adults + child_price * children + base_price);
  }, [adults, children, base_price, adult_price, child_price]);

  const validateForm = () => {
    const validationErrors = {};
    if (!date) validationErrors.date = "Please select a valid date.";
    if (adults < 1) validationErrors.adults = "At least one adult is required.";
    if (children < 0) validationErrors.children = "Invalid number of children.";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
  };

  const handleIncrement = (field) => {
    if (field === "adults") setAdults((prev) => prev + 1);
    if (field === "children") setChildren((prev) => prev + 1);
  };

  const handleDecrement = (field) => {
    if (field === "adults") setAdults((prev) => Math.max(1, prev - 1));
    if (field === "children") setChildren((prev) => Math.max(0, prev - 1));
  };

  const handleConfirmBooking = async () => {
    if (validateForm()) {
      const token = localStorage.getItem("token");
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const formData = {
        package: id,
        adult_count: adults,
        child_count: children,
        date: formattedDate,
      };

      try {
        await axios.post("/api/booked-holidays/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error booking package:", error.response?.data || error.message);
        toast.error("Booking failed. Please try again.");
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setIsModalOpen(false);
  };

  return (
    <div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="w-[80%] md:w-[70%] lg:w-[50%] bg-white p-6 md:p-12 lg:p-20 rounded-3xl shadow-lg relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="top-0 bg-white z-10">
              <button
                onClick={() => handleBookingModal(null)}
                className="w-[30%] lg:w-[15%] h-[15%] bg-[#4a4a48] text-[#fff] rounded-[19px] border-none flex justify-center items-center text-sm md:text-base"
              >
                Cancel
              </button>
              <h1 className="text-4xl font-extrabold flex justify-center items-center pb-4 text-[#4a4a48]">
                {name}
              </h1>
            </div>

            <div className="bg-[#fcfcfc] rounded-[15px] shadow-[0_0_09px_0_#000000] p-4 md:p-8">
              <div className="mb-4 p-2 md:p-5">
                <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-1">
                  Date
                </label>
                <Calendar
                  aria-label="Date Selection"
                  defaultValue={today(getLocalTimeZone())}
                  minValue={start ? parseDate(start) : undefined}
                  maxValue={end ? parseDate(end) : undefined}
                  onChange={handleDateChange}
                />
                {errors.date && (
                  <span className="text-red-500 text-sm">{errors.date}</span>
                )}
              </div>

              <div className="border-b border-[#dedede] my-2" />

              <div className="mb-4 p-2 md:p-5 flex justify-between items-center">
                <label className="text-sm md:text-[13.5px] font-medium text-[#787878]">
                  Adults <br /> Over 18+
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrement("adults")}
                    className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                  >
                    -
                  </button>
                  <span className="text-center text-sm md:text-[15px] font-medium">
                    {adults}
                  </span>
                  <button
                    onClick={() => handleIncrement("adults")}
                    className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                  >
                    +
                  </button>
                </div>
                {errors.adults && (
                  <span className="text-red-500 text-sm">{errors.adults}</span>
                )}
              </div>

              <div className="border-b border-[#dedede] my-2" />

              <div className="mb-4 p-2 md:p-5 flex justify-between items-center">
                <label className="text-sm md:text-[13.5px] font-medium text-[#787878]">
                  Children <br /> Under 18
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrement("children")}
                    className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                  >
                    -
                  </button>
                  <span className="text-center text-sm md:text-[15px] font-medium">
                    {children}
                  </span>
                  <button
                    onClick={() => handleIncrement("children")}
                    className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                  >
                    +
                  </button>
                </div>
                {errors.children && (
                  <span className="text-red-500 text-sm">{errors.children}</span>
                )}
              </div>

              <div className="border-b border-[#dedede] my-2" />

              <div className="flex justify-between items-center mt-4 p-2 md:p-5">
                <span className="text-sm md:text-[16px] font-medium text-[#5e5e5e]">
                  Total
                </span>
                <span className="w-auto font-medium text-[#646464]">
                  ₹{totalAmount}
                </span>
              </div>

              <div className="mt-6 flex justify-center items-center">
                <button
                  onClick={handleConfirmBooking}
                  className="w-full max-w-[70%] md:max-w-[40%] h-8 bg-[#4a4a48] text-[#e2e2e2] rounded-[19px] border-none text-sm md:text-base"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessModalClose}
        name={name}
      />
    </div>
  );
}