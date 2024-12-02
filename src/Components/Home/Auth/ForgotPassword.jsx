// import React, { useState, useEffect } from "react";
// import axios from "../../../Api";

// function ForgotPassword({ setIsModal }) {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [countdown, setCountdown] = useState(120);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const formattedCountdown = `${Math.floor(countdown / 60)
//     .toString()
//     .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`;

//   useEffect(() => {
//     if (countdown === 0) {
//       setShowSendAgain(true);
//     } else if (otpSent && countdown > 0) {
//       const timer = setInterval(() => {
//         setCountdown((prev) => prev - 1);
//       }, 1000);

//       return () => clearInterval(timer);
//     }
//   }, [countdown, otpSent]);

//   const handleSendOtp = async () => {
//     if (!/^\d{10}$/.test(phoneNumber)) {
//       setErrorMessage("Please enter a valid 10-digit phone number.");
//       return;
//     }
//     setErrorMessage(null);
//     setIsLoading(true);

//     try {
//       const response = await axios.post("api/user/forgot-number-verify", {
//         phone_number: phoneNumber,
//       });
//       console.log("OTP sent successfully:", response.data);
//       setOtpSent(true);
//       setCountdown(120); // Reset the countdown when OTP is sent
//     } catch (error) {
//       console.error(
//         "Failed to send OTP:",
//         error.response?.data || error.message
//       );
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
//     } catch (error) {
//       console.error(
//         "OTP verification failed:",
//         error.response?.data || error.message
//       );
//       setErrorMessage(
//         error.response?.data?.error || "Invalid OTP. Please try again."
//       );
//     } finally {
//       setIsLoading(false); // Hide loading spinner
//     }
//   };

//   // Handle password reset
//   const handlePasswordReset = async () => {
//     if (newPassword !== confirmPassword) {
//       setErrorMessage("Passwords do not match");
//       return;
//     }
  
//     setIsLoading(true); // Show loading spinner
//     try {
//       const response = await axios.post("api/user/reset-password/", {
//         phone_number: phoneNumber,
//         new_password: newPassword,
//         confirm_password: confirmPassword,
//       });
//       console.log("Password reset successfully:", response.data);
//       setIsModal('login'); // Close the modal after successful password reset
//     } catch (error) {
//       console.error("Password reset failed:", error.response?.data || error.message);
//       // Check if there's a specific validation error or non_field_error
//       if (error.response?.data?.error) {
//         setErrorMessage(error.response?.data?.error);
//       } else if (error.response?.data?.non_field_errors) {
//         setErrorMessage(error.response?.data?.non_field_errors[0]);
//       } else {
//         setErrorMessage("Password reset failed. Please try again.");
//       }
//     } finally {
//       setIsLoading(false); // Hide loading spinner
//     }
//   };
  
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
//         <button
//           onClick={() => setIsModal("login")} // Go back to the login modal
//           className="absolute top-4 left-4 text-gray-800 font-medium text-sm hover:shadow-2xl"
//         >
//           Back
//         </button>
//         <h2 className="font-['Open_Sauce_One'] text-[18px] font-medium text-black leading-[22px] mt-2">
//           Forgot Password
//         </h2>
//         <h3 className="font-['Open_Sauce_One'] mt-4 text-[12px]" >
//           Enter your registered phone number to reset your password.
//         </h3>
//       </div>

//       {/* Right Side - OTP Verification Form */}
//       <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
//         <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
//           Reset Password
//         </h1>

//         {/* Phone Number Input */}
//         {!otpSent && !otpVerified && (
//           <div className="mb-8">
//             <input
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
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

//         {/* Password Reset Form */}
//         {otpVerified && (
//           <div className="mb-8">
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               placeholder="New Password"
//               className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
//             />
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm Password"
//               className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 mt-4"
//             />
//             {errorMessage && (
//               <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
//             )}
//             <button
//               onClick={handlePasswordReset}
//               className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
//                 isLoading ? "bg-gray-400" : "bg-[#205a76]"
//               }`}
//               disabled={isLoading}
//             >
//               {isLoading ? "Resetting Password..." : "Reset Password"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;

import React, { useState, useEffect } from "react";
import axios from "../../../Api";

function ForgotPassword({ setIsModal }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [countdown, setCountdown] = useState(120);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formattedCountdown = `${Math.floor(countdown / 60)
    .toString()
    .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    if (countdown === 0) {
      setShowSendAgain(true);
    } else if (otpSent && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown, otpSent]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post("api/user/forgot-number-verify", {
        phone_number: phoneNumber,
      });
      console.log("OTP sent successfully:", response.data);
      setOtpSent(true);
      setCountdown(120); // Reset the countdown when OTP is sent
    } catch (error) {
      console.error(
        "Failed to send OTP:",
        error.response?.data || error.message
      );
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
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.data || error.message
      );
      setErrorMessage(
        error.response?.data?.error || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true); // Show loading spinner
    try {
      const response = await axios.post("api/user/reset-password/", {
        phone_number: phoneNumber,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      console.log("Password reset successfully:", response.data);
      setIsModal("login"); // Close the modal after successful password reset
    } catch (error) {
      console.error("Password reset failed:", error.response?.data || error.message);
      // Check if there's a specific validation error or non_field_error
      if (error.response?.data?.error) {
        setErrorMessage(error.response?.data?.error);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response?.data?.non_field_errors[0]);
      } else {
        setErrorMessage("Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

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
        <button
          onClick={() => setIsModal("login")} // Go back to the login modal
          className="absolute top-4 left-4 text-gray-800 font-medium text-sm hover:shadow-2xl"
        >
          Back
        </button>
        <h2 className="font-ubuntu text-[18px] font-medium text-black leading-[22px] mt-2">
          Forgot Password
        </h2>
        <h3 className="font-ubuntu mt-4 text-[12px]">
          Enter your registered phone number to reset your password.
        </h3>
      </div>

      {/* Right Side - OTP Verification Form */}
      <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
        <h1 className="font-ubuntu text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Reset Password
        </h1>

        {/* Phone Number Input */}
        {!otpSent && !otpVerified && (
          <div className="mb-8">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter Your Phone Number"
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-ubuntu text-[12px] placeholder-gray-500"
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
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-ubuntu text-[12px] placeholder-gray-500"
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

        {/* Password Reset Form */}
        {otpVerified && (
          <div className="mb-8">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-ubuntu text-[12px] placeholder-gray-500"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-ubuntu text-[12px] placeholder-gray-500 mt-4"
            />
            {errorMessage && (
              <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
            )}
            <button
              onClick={handlePasswordReset}
              className={`w-full h-[40px] mt-4 rounded-[6px] text-white font-medium shadow-md ${
                isLoading ? "bg-gray-400" : "bg-[#205a76]"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
