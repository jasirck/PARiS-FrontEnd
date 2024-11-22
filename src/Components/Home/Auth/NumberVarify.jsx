import React, { useState } from 'react';
import axios from '../../../Api';
import { FcGoogle } from "react-icons/fc";

function NumberVarify({ setIsModal }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSendOtp = async () => {
    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }
    setErrorMessage(null); // Clear any previous error messages

    try {
      // Send request to the backend
      const response = await axios.post('api/user/number_verify', { phone_number: phoneNumber });
      console.log('OTP sent successfully:', response.data);

      // Optional: handle success logic (e.g., move to OTP verification step)
    } catch (error) {
      console.error('Failed to send OTP:', error.response?.data || error.message);
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    // Logic to handle Google sign-in
    console.log('Google sign-in clicked');
  };

  return (
    <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
      {/* Left Side - Welcome Text */}
      <div className="flex-1 bg-[#f7f9fb] p-8 md:p-12 flex flex-col items-center justify-center text-center">
        <h2 className="font-['Open_Sauce_One'] text-[25px] font-semibold text-black leading-[30px]">
          Create an account
        </h2>
        <h3 className="font-['Open_Sauce_One'] text-[18px] font-medium text-black leading-[22px] mt-2">
          Join us and get started!
        </h3>
        <div className="mt-8">
          <p className="font-['Open_Sauce_One'] text-[12px]">
            Already have an account?{' '}
            <span onClick={() => setIsModal('login')} className="text-[#205a76] cursor-pointer">
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
        <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Register
        </h1>

        {/* Phone Number Input */}
        <div className="mb-8">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Your Phone Number"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
          {errorMessage && (
            <p className="text-red-500 text-[12px] mt-2">{errorMessage}</p>
          )}
          <button
            onClick={handleSendOtp}
            className="w-full h-[40px] mt-4 bg-[#205a76] rounded-[6px] text-white font-medium shadow-md"
          >
            Send OTP
          </button>
        </div>

        {/* Social Login */}
        <div className="text-center mt-6">
          <span className="font-['Open_Sauce_One'] text-[12px] text-[#b4b4b4]">
            or continue with
          </span>
          <div className="flex justify-center mt-4" onClick={handleGoogleSignIn}>
            <FcGoogle size={30} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NumberVarify;
