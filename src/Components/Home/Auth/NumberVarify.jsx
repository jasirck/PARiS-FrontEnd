// import React, { useState, useEffect } from "react";
// import axios from "../../../Api";

// function NumberVarify({ setIsModal, setPhoneNumber }) {
//   const [phoneNumber, setOtpSendeNumber] = useState(""); // Local state for phone number
//   const [otp, setOtp] = useState(""); // OTP input state
//   const [errorMessage, setErrorMessage] = useState(null); // For error messages
//   const [countdown, setCountdown] = useState(120); // 2 minutes countdown for OTP
//   const [otpSent, setOtpSent] = useState(false); // OTP sent state
//   const [otpVerified, setOtpVerified] = useState(false); // OTP verification state
//   const [showSendAgain, setShowSendAgain] = useState(false); // To show the "Send Again" button
//   const [isLoading, setIsLoading] = useState(false); // Loading state

//   // Format countdown timer as MM:SS
//   const formattedCountdown = `${Math.floor(countdown / 60)
//     .toString()
//     .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`;

//   // Start countdown timer
//   useEffect(() => {
//     if (countdown === 0) {
//       setShowSendAgain(true); // Show "Send Again" when countdown reaches 0
//     } else if (otpSent && countdown > 0) {
//       const timer = setInterval(() => {
//         setCountdown((prev) => prev - 1); // Decrement countdown every second
//       }, 1000);

//       return () => clearInterval(timer); // Clear the timer on component unmount
//     }
//   }, [countdown, otpSent]);

//   // Handle OTP sending
//   const handleSendOtp = async () => {
//     if (!/^\d{10}$/.test(phoneNumber)) {
//       setErrorMessage("Please enter a valid 10-digit phone number.");
//       return;
//     }
//     setErrorMessage(null); // Clear error message if phone number is valid
//     setIsLoading(true); // Show loading spinner

//     try {
//       // Send OTP request to the backend
//       const response = await axios.post("api/user/number-verify", {
//         phone_number: phoneNumber,
//       });
//       console.log("OTP sent successfully:", response.data);
//       setOtpSent(true);
//       setCountdown(120); // Reset the countdown when OTP is sent
//     } catch (error) {
//       console.error("Failed to send OTP:", error.response?.data || error.message);
//       setErrorMessage(
//         error.response?.data?.error || "Failed to send OTP. Please try again."
//       );
//     } finally {
//       setIsLoading(false); // Hide loading spinner
//     }
//   };

//   // Handle OTP submission
//   const handleOtpSubmit = async () => {
//     setIsLoading(true); // Show loading spinner
//     try {
//       const response = await axios.post("api/user/otp-verify", {
//         otp: otp,
//         phone_number: phoneNumber, // Include phone number to verify OTP
//       });
//       console.log("OTP verified successfully:", response.data);
//       setOtpVerified(true);

//       setPhoneNumber(phoneNumber); // Set phone number in the parent component state
//       setIsModal("register"); // Proceed to registration modal after successful verification
//     } catch (error) {
//       console.error("OTP verification failed:", error.response?.data || error.message);
//       setErrorMessage(
//         error.response?.data?.error || "Invalid OTP. Please try again."
//       );
//     } finally {
//       setIsLoading(false); // Hide loading spinner
//     }
//   };

//   // Handle "Send Again" button
//   const handleSendAgain = () => {
//     setOtpSent(false);
//     setShowSendAgain(false);
//     setOtp(""); // Clear OTP input
//     setCountdown(120); // Reset countdown
//     // Don't clear phone number for usability
//   };

//   return (
//     <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
//       {/* Left Side - Welcome Text */}
//       <div className="flex-1 bg-[#f7f9fb] p-8 md:p-12 flex flex-col items-center justify-center text-center">
//         <h2 className="font-['Open_Sauce_One'] text-[25px] font-semibold text-black leading-[30px]">
//           Create an account
//         </h2>
//         <h3 className="font-['Open_Sauce_One'] text-[18px] font-medium text-black leading-[22px] mt-2">
//           Join us and get started!
//         </h3>
//         <div className="mt-8">
//           <p className="font-['Open_Sauce_One'] text-[12px]">
//             Already have an account?{" "}
//             <span
//               onClick={() => setIsModal("login")}
//               className="text-[#205a76] cursor-pointer"
//             >
//               Sign in
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Right Side - OTP Verification Form */}
//       <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
//         <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
//           Register
//         </h1>

//         {/* Phone Number Input */}
//         {!otpSent && (
//           <div className="mb-8">
//             <input
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               value={phoneNumber}
//               onChange={(e) => setOtpSendeNumber(e.target.value)}
//               placeholder="Enter Your Phone Number"
//               className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
//             />
//             {errorMessage && (
//               <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
//             )}
//             <button
//               onClick={handleSendOtp}
//               className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
//                 isLoading ? "bg-gray-400" : "bg-[#205a76]"
//               }`}
//               disabled={isLoading}
//             >
//               {isLoading ? "Sending OTP..." : "Send OTP"}
//             </button>
//           </div>
//         )}

//         {/* OTP Input and Countdown */}
//         {otpSent && !otpVerified && (
//           <div className="mb-8">
//             <input
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="Enter OTP"
//               className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
//               disabled={countdown === 0}
//             />
//             <p className="text-gray-500 text-[12px] mt-2">
//               Time remaining: {formattedCountdown}  
//             </p>
            
//             {errorMessage && (
//               <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
//             )}
//             <button
//               onClick={handleOtpSubmit}
//               className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
//                 isLoading ? "bg-gray-400" : "bg-[#205a76]"
//               }`}
//               disabled={isLoading}
//             >
//               {isLoading ? "Verifying OTP..." : "Verify OTP"}
//             </button>
//             <p className="text-gray-500 text-[12px] mt-2 ml-0">
//               Wrong number?{" "}
//               <span
//                 onClick={handleSendAgain}
//                 className="text-[#205a76] cursor-pointer"
//               > 
//                 Edit
//               </span>
//             </p>
//           </div>
//         )}

//         {/* Send Again Button */}
//         {showSendAgain && (
//           <button
//             onClick={handleSendAgain}
//             className="w-full h-[40px] mt-4 bg-[#fcbf49] rounded-[6px] text-black font-medium shadow-md"
//           >
//             Send OTP Again
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default NumberVarify;



import React, { useState, useEffect } from "react";
import axios from "../../../Api";

function NumberVarify({ setIsModal, setPhoneNumber }) {
  const [phoneNumber, setOtpSendeNumber] = useState(""); // Local state for phone number
  const [otp, setOtp] = useState(""); // OTP input state
  const [errorMessage, setErrorMessage] = useState(null); // For error messages
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown for OTP
  const [otpSent, setOtpSent] = useState(false); // OTP sent state
  const [otpVerified, setOtpVerified] = useState(false); // OTP verification state
  const [showSendAgain, setShowSendAgain] = useState(false); // To show the "Send Again" button
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Format countdown timer as MM:SS
  const formattedCountdown = `${Math.floor(countdown / 60)
    .toString()
    .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`;

  // Start countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setShowSendAgain(true); // Show "Send Again" when countdown reaches 0
    } else if (otpSent && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1); // Decrement countdown every second
      }, 1000);

      return () => clearInterval(timer); // Clear the timer on component unmount
    }
  }, [countdown, otpSent]);

  // Handle OTP sending
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    setErrorMessage(null); // Clear error message if phone number is valid
    setIsLoading(true); // Show loading spinner

    try {
      // Send OTP request to the backend
      const response = await axios.post("api/user/number-verify", {
        phone_number: phoneNumber,
      });
      console.log("OTP sent successfully:", response.data);
      setOtpSent(true);
      setCountdown(120); // Reset the countdown when OTP is sent
    } catch (error) {
      console.error("Failed to send OTP:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.error || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async () => {
    setIsLoading(true); // Show loading spinner
    try {
      const response = await axios.post("api/user/otp-verify", {
        otp: otp,
        phone_number: phoneNumber, // Include phone number to verify OTP
      });
      console.log("OTP verified successfully:", response.data);
      setOtpVerified(true);

      setPhoneNumber(phoneNumber); // Set phone number in the parent component state
      setIsModal("register"); // Proceed to registration modal after successful verification
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.error || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  // Handle "Send Again" button
  const handleSendAgain = () => {
    setOtpSent(false);
    setShowSendAgain(false);
    setOtp(""); // Clear OTP input
    setCountdown(120); // Reset countdown
    // Don't clear phone number for usability
  };

  return (
    <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
      {/* Left Side - Welcome Text */}
      <div className="flex-1 bg-[#f7f9fb] p-8 md:p-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-[25px] font-semibold text-black leading-[30px]">
          Create an account
        </h2>
        <h3 className="text-[18px] font-medium text-black leading-[22px] mt-2">
          Join us and get started!
        </h3>
        <div className="mt-8">
          <p className="text-[12px]">
            Already have an account?{" "}
            <span
              onClick={() => setIsModal("login")}
              className="text-[#205a76] cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* Right Side - OTP Verification Form */}
      <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
        <h1 className="text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Register
        </h1>

        {/* Phone Number Input */}
        {!otpSent && (
          <div className="mb-8">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phoneNumber}
              onChange={(e) => setOtpSendeNumber(e.target.value)}
              placeholder="Enter Your Phone Number"
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none text-[12px] placeholder-gray-500"
            />
            {errorMessage && (
              <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
            )}
            <button
              onClick={handleSendOtp}
              className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
                isLoading ? "bg-gray-400" : "bg-[#205a76]"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* OTP Input and Countdown */}
        {otpSent && !otpVerified && (
          <div className="mb-8">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none text-[12px] placeholder-gray-500"
              disabled={countdown === 0}
            />
            <p className="text-gray-500 text-[12px] mt-2">
              Time remaining: {formattedCountdown}  
            </p>
            
            {errorMessage && (
              <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
            )}
            <button
              onClick={handleOtpSubmit}
              className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
                isLoading ? "bg-gray-400" : "bg-[#205a76]"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Verifying OTP..." : "Verify OTP"}
            </button>
            <p className="text-gray-500 text-[12px] mt-2 ml-0">
              Wrong number?{" "}
              <span
                onClick={handleSendAgain}
                className="text-[#205a76] cursor-pointer"
              > 
                Edit
              </span>
            </p>
          </div>
        )}

        {/* Send Again Button */}
        {showSendAgain && (
          <button
            onClick={handleSendAgain}
            className="w-full h-[40px] mt-4 bg-[#fcbf49] rounded-[6px] text-black font-medium shadow-md"
          >
            Send OTP Again
          </button>
        )}
      </div>
    </div>
  );
}

export default NumberVarify;
