import React, { useState } from 'react';
import axiosInstance from '../../Api'; // Import the Axios instance
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../Components/Toolkit/Slice/authSlice';


function AdminLogin () {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Redux dispatch to trigger login action
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to the backend
      const response = await axiosInstance.post('/api/admin/login/', formData);

      console.log(response.data); 
      
      dispatch(login({
        user: response.data.user,
        token: response.data.access,
        is_admin: response.data.is_admin
      }));

      // Redirect to the admin dashboard
      navigate('/admin');
      
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.detail || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf1f4]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/paris_logo.png"
              alt="Paris web app logo"
              className="w-28 h-28 object-contain"
            />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#f8fdff] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#f8fdff] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              {/* <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label> */}
            </div>

            <button type="button" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-lg font-semibold text-white bg-[#565656] hover:bg-[#4a4a4a] rounded-lg transition-all"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
