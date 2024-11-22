import React, { useState, useEffect } from "react";
import Dashboard from "./Home/Dashboard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { logout } from '../../Toolkit/Slice/authSlice';


function AdminBase() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, token } = useSelector((state) => state.auth); 
  const dispatch = useDispatch(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!token) {
      navigate("/adminlogin"); 
    }
    else {
      console.log(user, token); 
    }
  }, [token, navigate]); 
  

  // Logout handler
  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/adminlogin"); 
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
            <button className="w-full px-4 py-2 text-lg font-medium text-white bg-[#565656] hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all">
              Dashboard
            </button>
            <button className="w-full px-4 py-2 text-lg font-medium text-gray-700 bg-transparent hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all">
              Users
            </button>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Services</p>
              {["Holiday", "Packages", "Resort", "Visa"].map((item, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-lg font-medium text-gray-700 bg-transparent hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Request</p>
              {[
                "Holiday Request",
                "Packages Request",
                "Resort Request",
                "Visa Request",
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-lg font-medium text-gray-700 bg-transparent hover:bg-[#4a4a4a] hover:text-white rounded-lg transition-all"
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
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-[#eaf1f4] shadow z-10 lg:left-64">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            {/* Sidebar Toggle (for mobile) */}
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

            {/* Dashboard Title */}
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {/* User icon or profile picture */}
                <span className="text-gray-600 font-medium">J</span> {/* Placeholder for profile icon */}
              </div>

              <div
                className="text-right hidden sm:block"
                onClick={() =>
                  document.getElementById("dropdown-menu").classList.toggle("hidden")
                }
              >
                <p className="text-sm font-medium text-gray-900">JASIR</p>
                <p className="text-xs text-gray-500">muhammedjasir@gmail.com</p>

                {/* Dropdown Menu */}
                <div className="relative">
                  <div
                    id="dropdown-menu"
                    className="hidden absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <ul className="text-sm text-gray-700">
                      <li>
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={handleLogout} // Call logout handler
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 mt-16 overflow-auto p-4 lg:p-6">
          <Dashboard />
        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}


export default AdminBase;