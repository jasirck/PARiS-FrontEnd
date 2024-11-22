import React from 'react';
import GoogleAuth from './GoogleAuth';

function Login({ setIsModal }) {
  return (
      <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
        {/* Left Side - Welcome Text */}
        <div className="flex-1 bg-[#f7f9fb] p-8 md:p-14 flex flex-col items-center justify-center text-center">
          <h2 className="font-['Open_Sauce_One'] text-[25px] font-semibold text-black leading-[30px]">
            Sign in to
          </h2>
          <h3 className="font-['Open_Sauce_One'] text-[18px] font-medium text-black leading-[22px] mt-2">
            Lorem Ipsum is simply
          </h3>
          <div className="mt-8">
            <p className="font-['Open_Sauce_One'] text-[12px]">
              If you don't have an account, register
            </p>
            <p className="font-['Open_Sauce_One'] text-[12px] mt-1">
              You can{' '}
              <span
                className="text-[#205a76] cursor-pointer"
                onClick={() => setIsModal('verify')}
              >
                Register
              </span>{' '}
              <span className="text-[#205a76] cursor-pointer">here</span>!
            </p>
          </div>
        </div>
  
        {/* Right Side - Login Form */}
        <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
          <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
            Sign in
          </h1>
  
          {/* Name Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name"
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
            <span className="block text-right text-[10px] text-[#b0b0b0] mt-2 cursor-pointer">
              Forgot password?
            </span>
          </div>
  
          {/* Login Button */}
          <button className="w-full h-[40px] bg-[#205a76] rounded-[6px] text-white font-medium shadow-md">
            Login
          </button>
  
          {/* Social Login */}
          <div className="text-center mt-6">
            <span className="font-['Open_Sauce_One'] text-[12px] text-[#b4b4b4]">
              or continue with
            </span>
            <div className="flex justify-center mt-4">
              <GoogleAuth />
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;