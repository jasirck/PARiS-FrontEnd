import React, { useEffect, useState } from "react";
import axios from "../../../../utils/Api";
import { Calendar } from "@nextui-org/react";
import { toast } from 'sonner';
import { today, parseDate, getLocalTimeZone } from "@internationalized/date";
import SuccessModal from "../SuccessModal";

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
    console.log('adults',adults,'children',children,'base_price',base_price,'adult_price',adult_price,'child_price',child_price);
    
  }, [adults, children, base_price, adult_price, child_price]);

  const validateForm = () => {
    const validationErrors = {};
    const todayDate = new Date().toISOString().split("T")[0];
    
    if (!date) {
      validationErrors.date = "Please select a valid date.";
    } else if (new Date(date).toISOString().split("T")[0] < todayDate) {
      validationErrors.date = "Booking for past dates is not allowed.";
    }
  
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
    handleBookingModal(null);
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
        name={`${name} Package`}
      />
    </div>
  );
}