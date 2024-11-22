import React from 'react';
import { FcGoogle } from "react-icons/fc";

export default function Registration({ setIsModal }) {
  return (
    <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
      {/* Left Side - Welcome Text */}
      <div className="flex-1 bg-[#f7f9fb] p-8 md:p-12 flex flex-col items-center justify-center text-center">
        <h2 className="font-['Open_Sauce_One'] text-[25px] font-semibold text-black leading-[30px]">
          Create an account
        </h2>
        <h3 className="font-['Open_Sauce_One'] text-[18px] font-medium text-black leading-[22px] mt-2">
          Lorem Ipsum is simply
        </h3>
        <div className="mt-8">
          <p className="font-['Open_Sauce_One'] text-[12px]">
            Already have an account? 
            <span  onClick={setIsModal('login')}  className="text-[#205a76] cursor-pointer"> Sign in</span>
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
        <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Register
        </h1>

        {/* Name Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
        </div>

        {/* Password Input */}
        <div className="mb-8">
          <input
            type="password"
            placeholder="Password"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
        </div>

        {/* Confirm Password Input */}
        <div className="mb-8">
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
        </div>

        {/* Register Button */}
        <button className="w-full h-[40px] bg-[#205a76] rounded-[6px] text-white font-medium shadow-md">
          Register
        </button>

        {/* Social Login */}
        <div className="text-center mt-6">
          <span className="font-['Open_Sauce_One'] text-[12px] text-[#b4b4b4]">
            or continue with
          </span>
          <div className="flex justify-center mt-4">
            {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f5] rounded-lg shadow hover:shadow-md transition"> */}
              <FcGoogle size={30} />
              {/* <span className="font-['Open_Sauce_One'] text-[12px] text-black">
                Google
              </span>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
