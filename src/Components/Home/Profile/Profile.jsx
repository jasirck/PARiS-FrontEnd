
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Toolkit/Slice/authSlice";
import { useNavigate, useLocation, Routes, Route, Outlet } from "react-router-dom"; // Make sure Outlet is imported
import { Edit, LogOut, ArrowLeft, Save, X } from "lucide-react";
import axios from "../../../utils/Api";
import Holiday from "./Holiday/Holiday";
import Package from "./Packages/Packages";

// Profile Component
function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  const token = useSelector((state) => state.auth.token);

  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setUserData(data);
        setFormData({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          email: data.email,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) handleLogout();
      }
    };

    fetchUserData();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to profile
  const handleSaveClick = async () => {
    try {
      await axios.put("api/profile/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Cancel editing
  const handleCancelClick = () => {
    setFormData({
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone_number: userData.phone_number,
      email: userData.email,
    });
    setIsEditing(false);
  };

  // Navigation items
  const navItems = ["Holiday", "Packages", "Resort", "Flight", "Visa"];

  // Navigate to dynamic paths
  const handleNavClick = (item) => {
    navigate(`/profile/${item.toLowerCase()}`);
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#287094]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 bg-[#D4D4CE] shadow-md hover:bg-opacity-80 transition-colors px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-[#023246]" />
            <span className="text-[#023246] font-medium">Back</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-[#023246] text-white hover:bg-opacity-90 transition-colors px-4 py-2 rounded-lg shadow-md"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-[#D4D4CE] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2 gap-6 p-6">
          {/* Profile Image */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src={userData.user_image || "/user_image_demo.png"}
                alt="Profile"
                className="w-64 h-64 rounded-full object-cover border-4 border-[#287094] shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-[#287094] text-white rounded-full p-2 cursor-pointer">
                  <Edit className="h-5 w-5" />
                  <input type="file" className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {[ "username", "first_name", "last_name", "phone_number", "email" ].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm font-medium text-[#023246] mb-1">
                  {field.replace("_", " ")}
                </label>
                {isEditing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#287094] rounded-md focus:ring-2 focus:ring-[#287094] text-[#023246] bg-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-[#023246]">
                    {userData[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Edit/Save Buttons */}
            <div className="flex space-x-4 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelClick}
                    className="flex items-center space-x-2 bg-[#F6F6F6] text-[#023246] px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="flex items-center space-x-2 bg-[#287094] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-[#287094] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 bg-[#D4D4CE] rounded-xl shadow-lg overflow-hidden">
          <nav className="flex justify-center space-x-6 p-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  location.pathname.includes(item.toLowerCase())
                    ? "bg-[#287094] text-white"
                    : "text-[#023246] hover:bg-[#F6F6F6]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Routes */}
        <div className="bg-[#F2F2F0] mx-4 mt-12 sm:mx-8 my-1 px-1 sm:px-12 py-6 shadow-inner rounded-3xl">
          <Routes>
            <Route path="/" element={<Holiday />} />
            <Route path="/holiday" element={<Holiday />} />
            <Route path="/packages" element={<Package />} />
            <Route path="/resort" element={<div>Resort Content</div>} />
            <Route path="/flight" element={<div>Flight Content</div>} />
            <Route path="/visa" element={<div>Visa Content</div>} />
          </Routes>
          
        </div>
      </div>
    </div>
  );
}

export default Profile;
