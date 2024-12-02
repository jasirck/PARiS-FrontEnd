import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Dashboard from "./Home/Dashboard";
import Packages from "./Package/Packages";
import { useSelector } from "react-redux";
import Users from "./User/Users";
import Resorts from "./Resort/Resort";

function AdminBase() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, is_admin, profile, token } = useSelector((state) => state.auth);
  // const is_admin = true;
  // const token = true;
  const navigate = useNavigate();

  useEffect(() => {
    if (is_admin===false  || !token) {
      navigate("/adminlogin");
    } else {
      console.log(is_admin, token);
    }
  }, [is_admin, token, navigate]);

  const handleLogout = useCallback(() => {
    navigate("/adminlogin");
  }, [navigate]);

  const handleButtonClick = (button, path) => {
    setActiveButton(button);
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-[#eaf1f4]">
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
          <nav className="space-y-1">
            <button
              className={`w-full px-4 py-2 text-lg font-medium ${
                activeButton === "dashboard"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() => handleButtonClick("dashboard", "/admin")}
            >
              Dashboard
            </button>
            <button
              className={`w-full px-4 py-2 text-lg font-medium ${
                activeButton === "users"
                  ? "bg-[#565656] text-white"
                  : "bg-transparent text-gray-700"
              } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
              onClick={() => handleButtonClick("users", "/admin/users")}
            >
              Users
            </button>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Services</p>
              {["Holiday", "Packages", "Resort", "Visa"].map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleButtonClick(
                      item.toLowerCase(),
                      `/admin/${item.toLowerCase()}`
                    )
                  }
                  className={`w-full px-4 py-2 text-lg font-medium ${
                    activeButton === item.toLowerCase()
                      ? "bg-[#565656] text-white"
                      : "text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Requests</p>
              {[ 
                "Holiday Request", 
                "Packages Request", 
                "Resort Request", 
                "Visa Request"
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleButtonClick(
                      item.toLowerCase(),
                      `/admin/${item.toLowerCase()}`
                    )
                  }
                  className={`w-full px-4 py-2 text-lg font-medium ${
                    activeButton === item.toLowerCase()
                      ? "bg-[#565656] text-white"
                      : "text-gray-700"
                  } hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all`}
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="fixed top-0 left-0 right-0 bg-[#eaf1f4] shadow z-10 lg:left-64">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <button
              className="lg:hidden text-gray-700 focus:outline-none"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {activeButton}
            </h1>
            <div
              className="relative"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="cursor-pointer text-gray-700">JASIR</div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 mt-16 overflow-auto p-4 lg:p-6">
          <Routes>
            {/* <Route index element={<Dashboard />} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/packages" element={<Packages />} />
            {/* <Route path="/holidays" element={<Holiday />} /> */}
            <Route path="/users" element={<Users />} />
            <Route path="/resorts" element={<Resorts />} />
            {/* <Route path="/holidayrequest" element={<HolidayRequest />} />
            <Route path="/packagerequest" element={<PackageRequest />} />
            <Route path="/resortrequest" element={<ResortRequest />} />
            <Route path="/visarequest" element={<VisaRequest />} /> */}
          </Routes>
        </main>
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
