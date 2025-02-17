import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
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
import Visa from "./menu/Visa/visa";
import VisaNotificationComponent from "../VisaNotificationComponent";
import { IoChatbubblesSharp } from "react-icons/io5";
import UserChat from "../Chat";

function Base() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModal, setIsModal] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [chat, setChat] = useState(false); 

  const { user, profile, token } = useSelector((state) => state.auth);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    console.log(user, profile, token);

    console.log(isModal);
  }, [isModal]);

  return (
    <div className="bg-gray-100 w-full h-full">
      {/* Header Section */}
      <header className="flex justify-between items-center px-12 py-4">
        <section className="w-32 h-32">
          <img
            src="/paris_logo.png"
            alt="Paris web app logo"
            className="w-full h-full object-contain"
          />
        </section>
        <section className="ml-auto">
          {token ? ( // Check if user is logged in
            <div className="flex items-center space-x-4">
              <img
                onClick={() => navigate("/profile")}
                src={profile ? profile : "/user_image_demo.png"}
                alt={profile}
                className="w-12 h-12 rounded-full object-cover "
              />
              {/* <span className="text-gray-700 font-medium">{user}</span> */}
            </div>
          ) : (
            <button
              onClick={() => setIsModal("login")}
              className="bg-[#287094] text-white px-6 py-2 rounded-full hover:bg-[#1e5674] transition duration-200"
            >
              Sign In
            </button>
          )}
        </section>
      </header>

      {/* Rest of the component */}
      <section className="relative w-full px-4 sm:px-24 mt-8">
        <VisaNotificationComponent />
        <img
          className="rounded-3xl w-full max-h-96 object-cover"
          src="/PARiS-Home-Page.jpg"
          alt="Hero section background image"
        />
        <div className="absolute top-1/2 left-[13%] transform  -translate-y-1/2 text-white pl-4">
          <h1 className="text-4xl  font-medium">Stay</h1>
          <h1 className=" text-4xl  font-medium">Somewhere</h1>
          <h1 className="text-4xl font-medium">Unforgattable</h1>
        </div>
        <div className="bg-white w-3/4 sm:w-1/2 absolute left-1/2 transform -translate-x-1/2 -translate-y-8 rounded-full h-14 shadow-lg flex items-center px-4">
          <div className="flex items-center text-gray-600 font-medium flex-grow space-x-2">
            <IoSearchSharp className="text-xl text-gray-400" />
            <span>Hotel Name or Destination</span>
          </div>
          <button className="bg-[#287094] text-white px-4 py-2 rounded-full shadow hover:bg-[#1e5674] transition duration-200">
            Search
          </button>
        </div>
      </section>

      {/* Navigation Section */}
      <nav className="flex justify-center items-center text-gray-700 py-8 mt-6 rounded-lg space-x-8">
        <button
          onClick={() => navigate("/home")}
          className={`relative group bg-transparent border-none ${
            isActive("/home") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Home
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>

        <button
          onClick={() => navigate("/home/holiday")}
          className={`relative group bg-transparent border-none ${
            isActive("/home/holiday") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Holidays
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home/holiday") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>

        <button
          onClick={() => navigate("/home/packages")}
          className={`relative group bg-transparent border-none ${
            isActive("/home/packages") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Packages
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home/packages") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>

        <button
          onClick={() => navigate("/home/resort")}
          className={`relative group bg-transparent border-none ${
            isActive("/home/resort") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Resorts
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home/resort") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>
        <button
          onClick={() => navigate("/home/flights")}
          className={`relative group bg-transparent border-none ${
            isActive("/home/flights") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Flights
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home/flights") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>
        <button
          onClick={() => navigate("/home/visa")}
          className={`relative group bg-transparent border-none ${
            isActive("/home/visa") ? "text-[#287094]" : ""
          }`}
        >
          <h3 className="text-2xl font-semibold cursor-pointer transition duration-200">
            Visa
          </h3>
          <span
            className={`absolute left-0 bottom-0 h-0.5 bg-[#287094] transition-all duration-300 ${
              isActive("/home/visa") ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>
      </nav>

      {/* Content Section */}
      <div className="bg-[#F2F2F0] mx-4 sm:mx-8 my-1 px-1 sm:px-12 py-6 shadow-inner  rounded-3xl">
        <Routes>
          <Route index element={<Home setIsModal={setIsModal} />} />
          <Route path="home" element={<Home setIsModal={setIsModal} />} />
          <Route
            path="home/holiday"
            element={<Holiday setIsModal={setIsModal} />}
          />
          <Route
            path="home/packages"
            element={<Packages setIsModal={setIsModal} />}
          />
          <Route
            path="home/resort"  
            element={<Resort setIsModal={setIsModal} />}
          />
          <Route
            path="home/flights"
            element={<Flights setIsModal={setIsModal} />}
          />
          <Route path="home/visa" element={<Visa setIsModal={setIsModal} />} />
        </Routes>
      </div>
      {/* Chatbot Icon */}
      <div
        className="fixed bottom-6 right-6 bg-[#287094] text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-[#1e5674]"
        onClick={() => setChat(!chat)}
      >
        <IoChatbubblesSharp className="text-2xl" />
      </div>
      
      {/* Chat Component */}
      {chat && <UserChat onClose={() => setChat(false)} />}


      {/* Footer Section */}
      <footer className="bg-[#1E546F] text-white w-11/12 mx-auto pb-8 p-8 rounded-3xl my-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              PARiS Tours & Travels
            </h2>
            <p className="mb-2">
              Near Kotak Mahindra Bank, Nut Street, Vatakara, Calicut, 673104
            </p>
            <p>Near Mahe, Azhiyur Chungam, 673309</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>

            <p className="mb-2">Phone: 9207626627</p>
            <p className="mb-2">Phone: 9497714746</p>
            <p className="mb-2">Phone: 7306868537, 8606563820</p>

            <p className="mt-4 flex items-center">
              <HiMail className="mr-2" />
              <a
                href="mailto:paristourstravels@gmail.com"
                className="text-inherit hover:underline"
              >
                paristourstravels@gmail.com
              </a>
            </p>

            <p className="flex items-center">
              <FaSquareInstagram className="mr-2" />
              <a
                href="https://www.instagram.com/paris_tours_travels"
                className="text-inherit hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @paris_tours_travels
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © 2024 PARiS Tours & Travels. All rights reserved.
        </div>
      </footer>

      <div className="h-1 bg-gray-100 w-full"></div>
      {isModal.length > 0 && (
        <div
          onClick={() => setIsModal("")}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] max-w-[800px] flex justify-center items-center"
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
    </div>
  );
}

export default Base;
