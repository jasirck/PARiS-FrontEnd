import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Dashboard from "./Home/Dashboard";
import Packages from "./Package/Packages";
import { useDispatch, useSelector } from "react-redux";
import Users from "./User/Users";
import Resorts from "./Resort/Resort";
import Holiday from "./Holiday/Holiday";
import Category from "./Category/PackageCategory";
import ResortCategory from "./Category/ResortCategory copy";
import { logout } from "../../../Components/Toolkit/Slice/authSlice";
import { Button } from "@nextui-org/react";
import HolidayBooking from "./Booked Holiday/BookedHoliday";
import PackageBooking from "./Booked Package/BookedPackage";
import { a } from "framer-motion/client";
import BookedResort from "./Booked Resort/BookedResort";
import VisaCategory from "./Category/VisaCategory";
import Visa from "./Visa/Visa";
import BookedVisa from "./Booked VIsa/BookedVIsa";
import AdminChat from "./Chat";
import { IoChatbubblesSharp } from "react-icons/io5";

function AdminBase() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, is_admin, profile, token } = useSelector((state) => state.auth);
  const [packageId, setPackageId] = useState(null);
  const [resortId, setResortId] = useState(null);
  const [holidayId, setHolidayId] = useState(null);
  const [visaId, setVisaId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (is_admin === false || !token) {
      console.log(is_admin, token);
      navigate("/adminlogin");
    }
    const path = window.location.pathname;
    const firstWordAfterAdmin = path.split("/")[2];
    console.log("firstWordAfterAdmin", firstWordAfterAdmin);
    
    switch (firstWordAfterAdmin) {
      case "dashboard":
        setActiveButton("Dashboard");
        break;
      case "users":
        setActiveButton("Users");
        break;
      case "resorts":
        setActiveButton("Resorts");
        break;
      case "packages":
        setActiveButton("Packages");
        break;
      case "holiday":
        setActiveButton("Holiday");
        break;
      case "visa":
        setActiveButton("Visa");
        break;
      case "booked-holiday":
        setActiveButton("Booked Holiday");
        break;
      case "booked-packages":
        setActiveButton("Booked Packages");
        break;
      case "booked-resort":
        setActiveButton("Booked Resort");
        break;
      case "booked-visa":
        setActiveButton("Booked Visa");
        break;
      case "package-category":
        setActiveButton("Package Category");
        break;
      case "resort-category":
        setActiveButton("Resort Category");
        break;
      case "visa-category":
        setActiveButton("Visa Category");
      case "admin-chat":
        setActiveButton(" Admin Chat");
      default:
        console.warn(`Unknown route: ${firstWordAfterAdmin}`);
    }
  }, [is_admin, token, navigate]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/adminlogin");
  }, [navigate]);

  const handleButtonClick = (button, path) => {
    setActiveButton(button);
    navigate(path);
  };
  const handletrackid = (page, path, id, type) => {
    handleButtonClick(page, page);
    if (type === "package") {
      setPackageId(id);
    } else if (type === "resort") {
      setResortId(id);
    } else if (type === "holiday") {
      setHolidayId(id);
    } else if (type === "visa") {
      setVisaId(id);
    }
    navigate(path);
  };

  return (
    <div className="flex   bg-[#eaf1f4]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full w-64 bg-[#F6F6F6] shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block z-20`}
      >
        <div className="p-4">
          <div className="flex justify-center">
            <img
              src="/paris_logo.png"
              alt="Paris web app logo"
              className="w-28 h-28 object-contain"
            />
          </div>
          <nav className="space-y-1 ">
            <Button
              className={` px-4 py-2 text-lg font-medium text-left  ${
                activeButton === "Dashboard"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() => handleButtonClick("Dashboard", "/admin")}
            >
              Dashboard
            </Button>
            <br />
            <Button
              className={` px-4 py-2 text-lg font-medium text-left ${
                activeButton === "Users"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() => handleButtonClick("Users", "/admin/users")}
            >
              Users
            </Button>
            <Button
              className={` px-4 py-2 text-lg font-medium text-left ${
                activeButton === "Package Category"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() =>
                handleButtonClick("Package Category", "/admin/package-category")
              }
            >
              Package Category
            </Button>
            <Button
              className={` px-4 py-2 text-lg font-medium text-left ${
                activeButton === "Resort Category"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() =>
                handleButtonClick("Resort Category", "/admin/resort-category")
              }
            >
              Resort Category
            </Button>

            <Button
              className={` px-4 py-2 text-lg font-medium text-left ${
                activeButton === "Visa Category"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() =>
                handleButtonClick("Resort Category", "/admin/visa-category")
              }
            >
              Visa Category
            </Button>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Services</p>
              <div>
                <Button
                  onClick={() => handleButtonClick("Holiday", "/admin/holiday")}
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Holiday"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Holiday
                </Button>
              </div>
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick("Packages", "/admin/packages")
                  }
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Packages"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Packages
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => handleButtonClick("Resort", "/admin/resort")}
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Resort"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Resort
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => handleButtonClick("Visa", "/admin/visa")}
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Visa"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Visa
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Booking</p>
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick("Booked Holiday", "/admin/booked-holiday")
                  }
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Booked Holiday"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Booked Holiday
                </Button>
              </div>
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick(
                      "Booked Packages",
                      "/admin/booked-packages"
                    )
                  }
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Booked Packages"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Booked Packages
                </Button>
              </div>
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick("Booked Resort", "/admin/booked-resort")
                  }
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Booked Resort"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Booked Resort
                </Button>
              </div>
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick("Booked Visa", "/admin/booked-visa")
                  }
                  className={`px-4 py-2 text-lg font-medium text-left ${
                    activeButton === "Booked Visa"
                      ? "bg-[#565656] text-white"
                      : "bg-transparent text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  Booked Visa
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 h-full">
        <header className="fixed top-0 left-0 right-0 bg-[#eaf1f4] shadow z-10 lg:left-64">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            {/* Left Section: Placeholder for potential back button or menu */}
            <div></div>

            {/* Middle Section: Page Title */}
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {activeButton}
            </h1>

            {/* Right Section: Chat Icon + Profile Dropdown */}
            <div className="flex items-center gap-4">
              {/* Chat Icon */}
              <div
                className="bg-[#287094] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-[#1e5674]"
                onClick={() => navigate("/admin/admin-chat")}
              >
                <IoChatbubblesSharp className="text-2xl" />
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <div
                  className="cursor-pointer text-gray-700"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  {user}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                    <Button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="h-screen flex flex-col">
  <main className="flex-1 mt-16 min-h-80 overflow-auto p-4 lg:p-6">

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/packages"
              element={
                <Packages packageId={packageId} setPackageId={setPackageId} />
              }
            />
            <Route
              path="/holiday"
              element={
                <Holiday holidayId={holidayId} setHolidayId={setHolidayId} />
              }
            />
            <Route path="/users" element={<Users />} />
            <Route
              path="/resort"
              element={
                <Resorts resortId={resortId} setResortId={setResortId} />
              }
            />
            <Route
              path="/visa"
              element={<Visa visaId={visaId} setVisaId={setVisaId} />}
            />
            <Route path="/package-category" element={<Category />} />
            <Route path="/resort-category" element={<ResortCategory />} />
            <Route path="/visa-category" element={<VisaCategory />} />
            <Route
              path="/booked-holiday"
              element={<HolidayBooking handletrackid={handletrackid} />}
            />
            <Route
              path="/booked-packages"
              element={<PackageBooking handletrackid={handletrackid} />}
            />
            <Route
              path="/booked-resort"
              element={<BookedResort handletrackid={handletrackid} />}
            />
            <Route
              path="/booked-visa"
              element={<BookedVisa handletrackid={handletrackid} />}
            />

            <Route path="/admin-chat" element={<AdminChat  />} />
          </Routes>
        </main>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminBase;
