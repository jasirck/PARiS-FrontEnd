import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Toolkit/Slice/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from '../../../Api';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token); // Get token from Redux store

  const handleLogout = () => {
    dispatch(logout()); // Log out the user
    navigate('/'); // Redirect to home
  };

  useEffect(() => {
    console.log('token:', token);
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get('api/user/', {
          headers: { Authorization: `Bearer ${token}` }, // Add the JWT token in the header
        });
        setUserData(response.data); // Update state with user data
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          handleLogout(); // Logout if the token is invalid or expired
        }
      }
    };

    fetchUserData();
  }, [token]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container mx-auto my-0 w-full bg-[#fefefe] relative overflow-hidden">
      {/* Header Section */}
      <div className="header flex justify-between items-center px-4 py-2 sm:px-6 sm:py-4">
        <button
        onClick={() => navigate(-1)}
        className="back-btn bg-[#949494] text-white rounded-[10px] px-3 py-1 sm:px-4 sm:py-2 font-bold">
          Back
        </button>
        <button
          onClick={handleLogout}
          className="logout-btn bg-[#a18e8e] text-white rounded-[10px] px-6 py-2 font-bold"
        >
          Logout
        </button>
      </div>

      {/* Profile Details Section */}
      <div className="profile-details-container flex flex-col md:flex-row w-full max-w-[800px] mx-auto mt-4 bg-[#f9f9f9] rounded-lg shadow-md">
        <div className="user-image flex-1 flex items-center justify-center bg-[#eaeaea] p-4">
          <div className="image-wrapper w-[80%] md:w-[90%] h-[200px] md:h-full rounded-full">
            <img
              src={userData.user_image? userData.user_image : '/user_image_demo.png'} // Fallback for missing image
              alt="User Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <div className="user-details flex-1 flex flex-col justify-center p-4 md:p-6">
          <div className="info-row flex justify-between mb-2 md:mb-4">
            <span className="font-semibold text-gray-700">Username:</span>
            <span className="text-gray-600">{userData.username}</span>
          </div>
          <div className="info-row flex justify-between mb-2 md:mb-4">
            <span className="font-semibold text-gray-700">First Name:</span>
            <span className="text-gray-600">{userData.first_name}</span>
          </div>
          <div className="info-row flex justify-between mb-2 md:mb-4">
            <span className="font-semibold text-gray-700">Last Name:</span>
            <span className="text-gray-600">{userData.last_name}</span>
          </div>
          <div className="info-row flex justify-between mb-2 md:mb-4">
            <span className="font-semibold text-gray-700">Phone Number:</span>
            <span className="text-gray-600">{userData.phone_number}</span>
          </div>
          <div className="info-row flex justify-between">
            <span className="font-semibold text-gray-700">Email:</span>
            <span className="text-gray-600">{userData.email}</span>
          </div>
          <button className="edit-btn bg-[#949494] w-1/3 md:w-[20%] mt-4 text-white rounded-[10px] px-4 py-2 font-bold self-end">
            Edit
          </button>
        </div>
      </div>
       <div className="navigation bg-[#f2f2f0] w-full h-12 flex flex-wrap items-center shadow-2xl justify-center gap-8 mt-10 ">
         <button className="nav-item bg-[#949494] font-weight-bold text-white rounded-full px-8 py-3">
           Holiday
         </button>
         <span className="nav-item text-gray-700">Packages</span>
         <span className="nav-item text-gray-700">Resort</span>
         <span className="nav-item text-gray-700">Flight</span>
         <span className="nav-item text-gray-700">Visa</span>
       </div>
    </div>
  );
}

export default Profile;
