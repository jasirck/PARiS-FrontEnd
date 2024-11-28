import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "../../../Api"; // Replace with your Axios instance

export default function Registration({ setIsModal, phoneNumber }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "", // Add username to formData
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); // Object to track individual field errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    setFieldErrors({});
    setErrorMessage(null);

    // Password and confirmation password match check
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Email validation (basic format check)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Phone number validation (ensure it's a 10-digit number)
    if (!/^\d{10}$/.test(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const response = await axios.post("api/user/register", {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone_number: phoneNumber,
      });

      console.log(response.data.message); // Success message
      setIsModal("login"); // Navigate to login
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        setFieldErrors(backendErrors);
      } else if (error.response?.data?.username) {
        // Handle username unique constraint violation
        setFieldErrors({ username: error.response.data.username });
      } else {
        setErrorMessage(
          error.response?.data?.detail ||
            "Failed to register. Please try again."
        );
      }
    }
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

      {/* Right Side - Registration Form */}
      <div className="flex-1 p-8 md:p-12 bg-[#f7f9fb]">
        <h1 className="font-['Open_Sauce_One'] text-[20px] font-medium text-black mb-6 leading-[25px] text-center">
          Register
        </h1>

        {/* Username Field */}
        <div className="mb-6">
          <input
            type="text"
            name="username"
            placeholder="Enter your User Name"
            value={formData.username}
            onChange={handleChange}
            className={`w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 ${
              fieldErrors.username ? "border-2 border-red-500" : ""
            }`}
          />
          {fieldErrors.username && (
            <p className="text-red-500 text-[12px]">{fieldErrors.username}</p>
          )}
        </div>

        {/* First Name Field */}
        <div className="mb-6">
          <input
            type="text"
            name="first_name"
            placeholder="Enter your First name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 ${
              fieldErrors.first_name ? "border-2 border-red-500" : ""
            }`}
          />
          {fieldErrors.first_name && (
            <p className="text-red-500 text-[12px]">{fieldErrors.first_name}</p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="mb-6">
          <input
            type="text"
            name="last_name"
            placeholder="Enter your Last name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 ${
              fieldErrors.last_name ? "border-2 border-red-500" : ""
            }`}
          />
          {fieldErrors.last_name && (
            <p className="text-red-500 text-[12px]">{fieldErrors.last_name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="mb-6">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 ${
              fieldErrors.email ? "border-2 border-red-500" : ""
            }`}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-[12px]">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Fields */}
        <div className="mb-6">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500 ${
              fieldErrors.password ? "border-2 border-red-500" : ""
            }`}
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-[12px]">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-8">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full h-[40px] px-4 bg-[#bcd3de] rounded-[6px] outline-none font-['Open_Sauce_One'] text-[12px] placeholder-gray-500"
          />
        </div>

        {/* General Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-[12px] mb-4">{errorMessage}</p>
        )}

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="w-full h-[40px] bg-[#205a76] rounded-[6px] text-white font-medium shadow-md"
        >
          Register
        </button>
      </div>
    </div>
  );
}
