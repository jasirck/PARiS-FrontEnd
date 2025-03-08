import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, login } from "../../Toolkit/Slice/authSlice";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Edit, LogOut, ArrowLeft, Save, X } from "lucide-react";
import axios from "../../../utils/Api";
import { uploadToCloudinary } from "../../../utils/cloudinaryUtils"; 
import Holiday from "./Holiday/Holiday";
import Package from "./Packages/Packages";
import Resort from "./Resort/Resort";
import Flight from "./Flight/Flight";
import Visa from "./Visa/Visa";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    user_image: "",
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const token = useSelector((state) => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setUserData(data);
        setFormData({
          user_image: data.user_image,
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          email: data.email,
        });
        
        // Handle image preview based on source
        setImagePreview(
          data.user_image 
            ? data.user_image.includes("lh3.googleusercontent.com/a/") 
              ? data.user_image 
              : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${data.user_image}` 
            : "/user_image_demo.png"
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({...formErrors, [name]: ""});
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // Check file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setFormErrors({...formErrors, image: "Image size must be less than 5MB"});
      return;
    }
    
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear image error if present
      if (formErrors.image) {
        setFormErrors({...formErrors, image: ""});
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    
    if (formData.phone_number && !/^\d{10,15}$/.test(formData.phone_number.replace(/[^\d]/g, ''))) {
      errors.phone_number = "Phone number is invalid";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      let imageUrl = userData.user_image;
      let imageId = "";
  
      // Upload new image to Cloudinary if a file is selected
      if (imageFile) {
        const cloudinaryResponse = await uploadToCloudinary(imageFile);
        imageUrl = cloudinaryResponse.secure_url;
  
        // Extract image ID using URL class
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split("/");
        imageId = pathParts[pathParts.length - 1].split(".")[0];
      }
  
      // Prepare form data for the backend
      const updatedData = {
        ...formData,
        user_image: imageId || userData.user_image,
      };
  
      // Send updated profile data to the backend
      const response = await axios.put("api/profile/", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setUserData(response.data);
      setIsEditing(false);
      setImageFile(null);
      
      // Update profile in Redux state
      dispatch(login({profile: imageId || userData.user_image}));
      
      // Success notification
      const notification = document.getElementById("notification");
      if (notification) {
        notification.innerText = "Profile updated successfully!";
        notification.className = "notification success";
        notification.style.display = "block";
        setTimeout(() => {
          notification.style.display = "none";
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Error notification
      const notification = document.getElementById("notification");
      if (notification) {
        notification.innerText = "Failed to update profile. Please try again.";
        notification.className = "notification error";
        notification.style.display = "block";
        setTimeout(() => {
          notification.style.display = "none";
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    setFormData({
      user_image: userData.user_image,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone_number: userData.phone_number,
      email: userData.email,
    });
    setImageFile(null);
    setFormErrors({});
    setImagePreview(
      userData.user_image 
        ? userData.user_image.includes("lh3.googleusercontent.com/a/") 
          ? userData.user_image 
          : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${userData.user_image}` 
        : "/user_image_demo.png"
    );
    setIsEditing(false);
  };

  const navItems = ["Holiday", "Packages", "Resort", "Flight", "Visa"];

  const handleNavClick = (item) => {
    navigate(`/profile/${item.toLowerCase()}`);
  };

  if (isLoading && !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#287094]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] py-4 sm:py-8 px-2 sm:px-4">
      {/* Notification component */}
      <div 
        id="notification" 
        className="notification" 
        style={{display: 'none', position: 'fixed', top: '20px', right: '20px', zIndex: 50}}
      ></div>
      
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between mb-4 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 sm:space-x-2 bg-[#D4D4CE] shadow-md hover:bg-opacity-80 transition-colors px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#023246]" />
            <span className="text-[#023246] text-sm sm:text-base font-medium">Back</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 sm:space-x-2 bg-[#023246] text-white hover:bg-opacity-90 transition-colors px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md text-sm sm:text-base"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-[#D4D4CE] rounded-xl shadow-2xl overflow-hidden p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-40 h-40 sm:w-64 sm:h-64 rounded-full object-cover border-4 border-[#287094] shadow-lg"
                  loading="lazy"
                />
                {isEditing && (
                  <div className="relative">
                    <label className="absolute bottom-0 right-0 bg-[#287094] text-white rounded-full p-2 cursor-pointer">
                      <Edit className="h-5 w-5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleImageChange} 
                        accept="image/*"
                      />
                    </label>
                    {formErrors.image && (
                      <p className="text-red-500 text-xs mt-1 text-center">
                        {formErrors.image}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {["username", "first_name", "last_name", "phone_number", "email"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-xs sm:text-sm font-medium text-[#023246] mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type={field === "email" ? "email" : field === "phone_number" ? "tel" : "text"}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm sm:text-base border ${
                          formErrors[field] ? 'border-red-500' : 'border-[#287094]'
                        } rounded-md focus:ring-2 focus:ring-[#287094] text-[#023246] bg-white`}
                        placeholder={`Enter your ${field.replace(/_/g, " ")}`}
                      />
                      {formErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-[#023246] break-words">
                      {userData[field] || "-"}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex space-x-2 sm:space-x-4 mt-4 sm:mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelClick}
                      className="flex items-center justify-center space-x-1 sm:space-x-2 bg-[#F6F6F6] text-[#023246] px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-opacity-80 transition-colors text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveClick}
                      className="flex items-center justify-center space-x-1 sm:space-x-2 bg-[#287094] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      ) : (
                        <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                      <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-[#287094] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm sm:text-base"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-[#D4D4CE] rounded-xl shadow-lg overflow-hidden">
          <nav className="flex flex-wrap justify-center gap-2 sm:gap-6 p-3 sm:p-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-full transition-colors ${
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

        <div className="bg-[#F2F2F0] mx-2 sm:mx-8 mt-8 sm:mt-12 mb-1 px-2 sm:px-12 py-4 sm:py-6 shadow-inner rounded-3xl">
          <Routes>
            <Route path="/" element={<Holiday />} />
            <Route path="/holiday" element={<Holiday />} />
            <Route path="/packages" element={<Package />} />
            <Route path="/resort" element={<Resort />} />
            <Route path="/flight" element={<Flight />} />
            <Route path="/visa" element={<Visa />} />
          </Routes>
        </div>
      </div>

      {/* CSS for notification */}
      <style jsx="true">{`
        .notification {
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease;
        }
        
        .notification.success {
          background-color: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }
        
        .notification.error {
          background-color: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;