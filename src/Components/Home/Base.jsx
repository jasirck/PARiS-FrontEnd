

import React, { useEffect, useState, useRef } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import {  useDispatch, useSelector } from "react-redux";
import { logout } from "../Toolkit/Slice/authSlice";
import Home from "./menu/Home";
import Packages from "./menu/Package/Packages";
import Holiday from "./menu/Holiday/Holidays";
import Resort from "./menu/Resort/Resort";
import Registration from "./Auth/Registration";
import Login from "./Auth/Login";
import NumberVarify from "./Auth/NumberVarify";
import ForgotPassword from "./Auth/ForgotPassword";
import { FaSquareInstagram } from "react-icons/fa6";
import { HiMail } from "react-icons/hi";
import Flights from "./menu/Flights/Flights";
import Visa from "./menu/Visa/Visa";
import VisaNotificationComponent from "../VisaNotificationComponent";
import { IoChatbubblesSharp } from "react-icons/io5";
import {  FaWhatsapp } from "react-icons/fa";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import UserChat from "../Chat";

function Base() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModal, setIsModal] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [chat, setChat] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { user, profile, token } = useSelector((state) => state.auth);
  const isActive = (path) => location.pathname === path;
  
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  // Handle responsive behavior on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMobileMenu(false);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/home");
  };

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "School/College", path: "/home/holiday" },
    { name: "Packages", path: "/home/packages" },
    { name: "Resorts", path: "/home/resort" },
    { name: "Flights", path: "/home/flights" },
    { name: "Visa", path: "/home/visa" }
  ];

  return (
    <div className="bg-gray-100 w-full min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center px-4 sm:px-8 md:px-12 py-3 sm:py-4 relative">
        <section className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
          <img
            src="/paris_logo.png"
            alt="Paris Tours & Travels"
            className="w-full h-full object-contain"
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer" }}
          />
        </section>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 z-20" 
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          {mobileMenu ? 
            <RiCloseLine className="text-3xl" /> : 
            <RiMenu3Line className="text-3xl" />
          }
        </button>
        
        {/* Desktop User Section */}
        <section className="hidden md:block ml-auto">
          {token ? (
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img
                  onClick={() => navigate("/profile")}
                  src={profile ? (profile.includes("lh3.googleusercontent.com/a/")) ? profile : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${profile}` : "/user_image_demo.png"}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-[#287094] transition-transform hover:scale-105"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate("/profile")}
                  >
                    My Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsModal("login")}
              className="bg-[#287094] text-white px-5 py-2 rounded-full hover:bg-[#1e5674] transition duration-200 shadow-md"
            >
              Sign In
            </button>
          )}
        </section>
      </header>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div 
          ref={menuRef}
          className="fixed inset-0 bg-white z-10 pt-20 px-4 md:hidden"
        >
          <div className="flex flex-col space-y-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                className={`text-left text-xl font-semibold py-2 ${
                  isActive(item.path) ? "text-[#287094]" : "text-gray-700"
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {/* Mobile User Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {token ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={profile ? (profile.includes("lh3.googleusercontent.com/a/")) ? profile : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${profile}` : "/user_image_demo.png"}
                      alt="User Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#287094]"
                    />
                    <span className="text-gray-700 font-medium">{user || "User"}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate("/profile");
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 text-left"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenu(false);
                    }}
                    className="bg-[#287094] text-white px-4 py-2 rounded-lg hover:bg-[#1e5674] transition duration-200 text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    setIsModal("login");
                  }}
                  className="w-full bg-[#287094] text-white px-4 py-3 rounded-lg hover:bg-[#1e5674] transition duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-8 md:px-24 mt-4 sm:mt-8">
        <VisaNotificationComponent />
        <div className="rounded-3xl overflow-hidden shadow-md aspect-[21/9] max-h-96 w-full">
          <img
            className="w-full h-full object-cover"
            src="/PARiS-Home-Page.jpg"
            alt="Beautiful travel destination"
            loading="lazy"
          />
        </div>
        <div className="absolute top-1/2 left-[8%] sm:left-[13%] transform -translate-y-1/2 text-white pl-2 sm:pl-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-shadow">Stay</h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-shadow">Somewhere</h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-shadow">Unforgattable</h1>
        </div>
        
        {/* Search Bar */}
        {/* <form 
          onSubmit={handleSearch}
          className={`bg-white w-11/12 sm:w-3/4 md:w-1/2 absolute left-1/2 transform -translate-x-1/2 -translate-y-6 sm:-translate-y-8 rounded-full h-10 sm:h-14 shadow-lg flex items-center px-3 sm:px-4 transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-[#287094]' : ''}`}
        >
          <div className="flex items-center text-gray-600 font-medium flex-grow space-x-2">
            <IoSearchSharp className="text-lg sm:text-xl text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Hotel Name or Destination"
              className="bg-transparent outline-none w-full text-sm sm:text-base py-1"
            />
          </div>
          <button 
            type="submit"
            className="bg-[#287094] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow hover:bg-[#1e5674] transition duration-200 text-xs sm:text-sm whitespace-nowrap"
          >
            Search
          </button>
        </form> */}
      </section>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center items-center text-gray-700 py-6 sm:py-8 mt-6 rounded-lg space-x-4 lg:space-x-8 px-4 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative group bg-transparent border-none ${
              isActive(item.path) ? "text-[#287094]" : ""
            }`}
          >
            <h3 className="text-xl lg:text-2xl font-semibold cursor-pointer transition duration-200 whitespace-nowrap">
              {item.name}
            </h3>
            <span
              className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
                isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </button>
        ))}
      </nav>

      {/* Content Section */}
      <div className="flex-grow bg-[#F2F2F0] mx-4 sm:mx-8 my-1 px-2 sm:px-6 md:px-12 py-6 shadow-inner rounded-3xl">
        <Routes>
          <Route index element={<Home setIsModal={setIsModal} />} />
          <Route path="home/" element={<Home setIsModal={setIsModal} />} />
          <Route path="home/holiday" element={<Holiday setIsModal={setIsModal} />} />
          <Route path="home/packages" element={<Packages setIsModal={setIsModal} />} />
          <Route path="home/resort" element={<Resort setIsModal={setIsModal} />} />
          <Route path="home/flights" element={<Flights setIsModal={setIsModal} />} />
          <Route path="home/visa" element={<Visa setIsModal={setIsModal} />} />
        </Routes>
      </div>
      
      {/* Chatbot Icon */}
      <div
        className="fixed bottom-6 right-6 bg-[#287094] text-white p-3 sm:p-4 rounded-full shadow-lg cursor-pointer hover:bg-[#1e5674] transition-transform hover:scale-105 z-10"
        onClick={() => setChat(!chat)}
        aria-label="Chat with us"
      >
        <IoChatbubblesSharp className="text-xl sm:text-2xl" />
      </div>
      
      {/* Chat Component */}
      {chat && <UserChat onClose={() => setChat(false)} />}

      {/* Footer Section
      <footer className="bg-[#1E546F] text-white w-11/12 mx-auto pb-6 sm:pb-8 p-6 sm:p-8 rounded-3xl my-8 sm:my-12 mt-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              PARiS Tours & Travels
            </h2>
            <p className="mb-2 text-sm sm:text-base">
              Near Kotak Mahindra Bank, Nut Street, Vatakara, Calicut, 673104
            </p>
            <p className="text-sm sm:text-base">Near Mahe, Azhiyur Chungam, 673309</p>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact</h3>
            <p className="mb-2 text-sm sm:text-base">Phone: 9207626627</p>
            <p className="mb-2 text-sm sm:text-base">Phone: 9497714746</p>
            <p className="mb-2 text-sm sm:text-base">Phone: 7306868537, 8606563820</p>

            <div className="mt-4 flex items-center">
              <HiMail className="mr-2 text-lg" />
              <a
                href="mailto:paristourstravels@gmail.com"
                className="text-inherit hover:underline text-sm sm:text-base"
              >
                paristourstravels@gmail.com
              </a>
            </div>

            <div className="flex items-center mt-2">
              <FaSquareInstagram className="mr-2 text-lg" />
              <a
                href="https://www.instagram.com/paris_tours_travels"
                className="text-inherit hover:underline text-sm sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
              >
                @paris_tours_travels
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm">
          © 2024 PARiS Tours & Travels. All rights reserved.
        </div>
      </footer>*/}



<footer className="bg-[#1E546F] text-white w-11/12 mx-auto pb-6 sm:pb-8 p-6 sm:p-8 rounded-3xl my-8 sm:my-12 mt-auto">
      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            PARiS Tours & Travels
          </h2>
          <p className="mb-2 text-sm sm:text-base">
            Near Kotak Mahindra Bank, Nut Street, Vatakara, Calicut, 673104
          </p>
          <p className="text-sm sm:text-base">Near Mahe, Azhiyur Chungam, 673309</p>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact</h3>
          <p className="mb-2 text-sm sm:text-base">Phone: 9207626627</p>
          <p className="mb-2 text-sm sm:text-base">Phone: 9497714746</p>
          <p className="mb-2 text-sm sm:text-base">Phone: 7306868537, 8606563820</p>

          {/* Email */}
          <div className="mt-4 flex items-center">
            <HiMail className="mr-2 text-lg" />
            <a
              href="mailto:paristourstravels@gmail.com"
              className="text-inherit hover:underline text-sm sm:text-base"
            >
              paristourstravels@gmail.com
            </a>
          </div>

          {/* Instagram */}
          <div className="flex items-center mt-2">
            <FaSquareInstagram className="mr-2 text-lg" />
            <a
              href="https://www.instagram.com/paris_tours_travels"
              className="text-inherit hover:underline text-sm sm:text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              @paris_tours_travels
            </a>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center mt-2">
            <FaWhatsapp className="mr-2 text-lg text-green-400" />
            <a
              href="https://wa.me/9497714746"
              className="text-inherit hover:underline text-sm sm:text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              9497714746
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm">
        © 2024 PARiS Tours & Travels. All rights reserved.
      </div>
    </footer>





      {/* Modals */}
      {isModal.length > 0 && (
        <div
          onClick={() => setIsModal("")}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[95%] sm:w-[90%] max-w-[800px] flex justify-center items-center"
          >
            {isModal === "register" ? (
              <Registration setIsModal={setIsModal} phoneNumber={phoneNumber} />
            ) : isModal === "login" ? (
              <Login setIsModal={setIsModal} />
            ) : isModal === "verify" ? (
              <NumberVarify
                setIsModal={setIsModal}
                setPhoneNumber={setPhoneNumber}
              />
            ) : isModal === "forgot" ? (
              <ForgotPassword setIsModal={setIsModal} />
            ) : null}
          </div>
        </div>
      )}

      {/* Add text shadow style */}
      <style jsx="true">{`
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default Base;