import React, { useEffect, useState } from "react";
import { Calendar } from "@nextui-org/react";
import PaymentForm from "../../PaymentForm";
import { today, parseDate, getLocalTimeZone } from "@internationalized/date";
import { Toaster, toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form';

export default function BookingModal({
  handleBookingModal,
  isModalOpen,
  data,
}) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [startDate, setStartDate] = useState(today(getLocalTimeZone()));
  const [endDate, setEndDate] = useState(null);
  const [minEndDate, setMinEndDate] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { 
    name, 
    start, 
    end, 
    base_price, 
    adult_price, 
    child_price 
  } = data;

  const MAX_GUESTS = 30;
  const MAX_STAY_DURATION = 14; 
  
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    defaultValues: {
      startDate: today(getLocalTimeZone()),
      endDate: null
    }
  });
  
  useEffect(() => {
    setTotalAmount(
      base_price + 
      (adult_price * adults) + 
      (child_price * children)
    );
  }, [adults, children, base_price, adult_price, child_price]);

  const onSubmit = (data) => {
    setShowPayment(true);
    console.log(data);
    
  };

  const handleStartDateChange = (selectedDate) => {
    setStartDate(selectedDate);
    
    const newMinEndDate = selectedDate.add({ days: 1 });
    setMinEndDate(newMinEndDate);
    
    if (endDate && endDate < newMinEndDate) {
      setEndDate(newMinEndDate);
      setValue('endDate', newMinEndDate);
    }
    
    setValue('startDate', selectedDate);
    setValue('adults', adults);
    setValue('children', children);
    setValue('totalAmount', totalAmount);
  };

  const handleEndDateChange = (selectedDate) => {
    setEndDate(selectedDate);
    setValue('endDate', selectedDate);
  };

  const handleIncrement = (field) => {
    if (field === "adults" && adults < MAX_GUESTS) 
      setAdults((prev) => prev + 1);
    if (field === "children" && (adults + children) < MAX_GUESTS) 
      setChildren((prev) => prev + 1);
  };

  const handleDecrement = (field) => {
    if (field === "adults") setAdults((prev) => Math.max(1, prev - 1));
    if (field === "children") setChildren((prev) => Math.max(0, prev - 1));
  };

  const calculateDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    
    const startTime = new Date(start.toString()).getTime();
    const endTime = new Date(end.toString()).getTime();
    
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((endTime - startTime) / millisecondsPerDay);
  };

  if (showPayment) {
    return (
      <PaymentForm
        amount={totalAmount}
        name={name}
        adults={adults}
        children={children}
        startDate={startDate?.toString()}
        endDate={endDate?.toString()}
        package_id={data.id}
      />
    );
  }

  return (
    <div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="w-[80%] md:w-[70%] lg:w-[60%] bg-white p-6 md:p-12 lg:p-20 rounded-3xl shadow-lg relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="top-0 bg-white z-10">
              <button
                onClick={handleBookingModal}
                className="w-[30%] lg:w-[15%] bg-[#4a4a48] text-[#fff] rounded-[19px] border-none flex justify-center items-center text-sm md:text-base"
              >
                Cancel
              </button>
              <h1 className="text-4xl font-extrabold flex justify-center items-center pb-4 text-[#4a4a48]">
                {name}
              </h1>
            </div>

            <div className="bg-[#fcfcfc] rounded-[15px] shadow-[0_0_09px_0_#000000] p-4 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 p-2 md:p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-2">
                        Start Date
                      </label>
                      <Controller
                        control={control}
                        name="startDate"
                        rules={{
                          required: "Start date is required",
                          validate: (value) => {
                            if (value && value < today(getLocalTimeZone())) {
                              toast.error("Start date cannot be in the past");
                              return "Start date cannot be in the past";
                            }
                          },
                        }}
                        render={({ field }) => (
                          <Calendar
                            aria-label="Start Date Selection"
                            minValue={today(getLocalTimeZone())}
                            onChange={handleStartDateChange}
                            value={field.value}
                            className="w-full"
                          />
                        )}
                      />
                      {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-2">
                        End Date
                      </label>
                      <Controller
                        control={control}
                        name="endDate"
                        rules={{
                          required: "End date is required",
                          validate: (value) => {
                            if (!value) return "End date is required";
                            if (startDate && value < startDate) {
                              toast.error("End date must be after start date");
                              return "End date must be after start date";
                            }
                            // Optional: Add max stay duration validation
                            const daysDifference = calculateDaysBetween(startDate, value);
                            if (daysDifference > MAX_STAY_DURATION) {
                              toast.error(`Maximum stay is ${MAX_STAY_DURATION} days`);
                              return `Maximum stay is ${MAX_STAY_DURATION} days`;
                            }
                          },
                        }}
                        render={({ field }) => (
                          <Calendar
                            aria-label="End Date Selection"
                            minValue={minEndDate}
                            onChange={handleEndDateChange}
                            value={field.value}
                            className="w-full"
                          />
                        )}
                      />
                      {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Remaining code stays the same as previous submission */}
                <div className="border-b border-[#dedede] my-2" />

                <div className="mb-4 p-2 md:p-5 flex justify-between items-center">
                  <label className="text-sm md:text-[13.5px] font-medium text-[#787878]">
                    Adults <br /> Over 18+  &nbsp; ₹{adult_price}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecrement("adults")}
                      className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                    >
                      -
                    </button>
                    <span className="text-center text-sm md:text-[15px] font-medium">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement("adults")}
                      className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-b border-[#dedede] my-2" />

                <div className="mb-4 p-2 md:p-5 flex justify-between items-center">
                  <label className="text-sm md:text-[13.5px] font-medium text-[#787878]">
                    Children <br /> Under 18 &nbsp; ₹{child_price}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecrement("children")}
                      className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                    >
                      -
                    </button>
                    <span className="text-center text-sm md:text-[15px] font-medium">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement("children")}
                      className="w-[30px] md:w-[35px] h-[30px] md:h-[35px] rounded-full bg-white text-[#4a4a48] border-[#4a4a48] hover:shadow-[0_0_05px_0_#000000] flex justify-center items-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-b border-[#dedede] my-2" />

                <div className="flex justify-between items-center mt-4 p-2 md:p-5">
                  <span className="text-sm md:text-[16px] font-medium text-[#5e5e5e]">
                    Total <br /> + ₹{base_price}
                  </span>
                  <span className="w-auto font-medium text-[#646464]">
                    ₹{totalAmount}
                  </span>
                </div>

                <div className="mt-6 flex justify-center items-center">
                  <button
                    type="submit"
                    className="w-full max-w-[70%] md:max-w-[40%] h-8 bg-[#4a4a48] text-[#e2e2e2] rounded-[19px] border-none text-sm md:text-base"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}