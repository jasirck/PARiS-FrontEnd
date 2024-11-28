import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from '../../../Api';
import { login } from '../../Toolkit/Slice/authSlice'; 
import GoogleAuth from './GoogleAuth';

function Login({ setIsModal }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent default form submission
    setErrorMessage(null); // Reset error message

    try {
      const response = await axios.post("api/user/login", {
        username: formData.username,
        password: formData.password,
      });      

      // On success, dispatch login to Redux and store in localStorage
      if (response.data.token) {
        console.log(response.data);
        
        dispatch(login({
          refresh_token: response.data.refresh,
          user: formData.username,
          token: response.data.token,
          is_admin: response.data.is_admin,
          profile: response.data.profile,
        }));

        // Close modal or redirect to home
        setIsModal("");
      }
    } catch (error) {
      setErrorMessage("Invalid username or password.");
    }
  };

  return (
    <div className="relative w-[90%] max-w-[800px] bg-white rounded-2xl shadow-md overflow-hidden z-10 flex flex-col md:flex-row">
      {/* Left Side - Welcome Text */}
      <div className="flex-1 bg-[#f7f9fb] p-8 md:p-14 flex flex-col items-center justify-center text-center">
        <h2 className="text-[25px] font-semibold text-black leading-[30px]">
          Sign in to
        </h2>
        <h3 className="text-[18px] font-medium text-black leading-[22px] mt-2">
          Lorem Ipsum is simply
        </h3>
        <div className="mt-8">
          <p className="text-[12px]">
            If you don't have an account, register
          </p>
          <p className="text-[12px] mt-1">
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
        <h1 className="text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Sign in
        </h1>

        {/* Name Input */}
        <div className="mb-6">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none text-[12px] placeholder-gray-500"
          />
        </div>

        {/* Password Input */}
        <div className="mb-8">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none text-[12px] placeholder-gray-500"
          />
          <span 
          onClick={() => setIsModal('forgot')}
          className="block text-right text-[10px] text-[#b0b0b0] mt-2 cursor-pointer">
            Forgot password?
          </span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full h-[40px] bg-[#205a76] rounded-[6px] text-white font-medium shadow-md"
        >
          Login
        </button>

        {/* Social Login */}
        <div className="text-center mt-6">
          <span className="text-[12px] text-[#b4b4b4]">
            or continue with
          </span>
          <div className="flex justify-center mt-4">
            <GoogleAuth setIsModal={setIsModal} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
