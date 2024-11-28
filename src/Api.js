import axios from 'axios';
import { logout, login } from './Components/Toolkit/Slice/authSlice'; // Import your Redux actions
import store from './Components/Toolkit/store'; // Import your Redux store

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/", // Adjust the base URL as needed
    headers: {
        "Content-Type": "application/json", 
        
    },
});

// Request interceptor to add token to the header of each request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration and refreshing the token
axiosInstance.interceptors.response.use(
    (response) => response, // If the response is successful, just return it
    async (error) => {
        const originalRequest = error.config;

        // Check if error status is 401 (Unauthorized) and handle token refresh
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh_token = localStorage.getItem('refresh_token');
            
            if (refresh_token) {
                try {
                    // Attempt to refresh the token
                    const refreshResponse = await axios.post('/api/token/refresh/', { refresh_token });
                    const newAccessToken = refreshResponse.data.access;

                    // Update the Redux state with the new access token
                    store.dispatch(login({
                        token: newAccessToken,
                        refresh_token,
                        user: localStorage.getItem('user'),
                        is_admin: localStorage.getItem('is_admin'),
                        profile: localStorage.getItem('profile'),
                    }));

                    // Update the Authorization header with the new token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest); // Retry the original request with the new token
                } catch (err) {
                    // If refresh fails, log out the user and clear localStorage
                    store.dispatch(logout());
                    localStorage.removeItem('refresh_token');
                    return Promise.reject(err); // Reject the error
                }
            } else {
                store.dispatch(logout());
                return Promise.reject(error); // No refresh token, log out the user
            }
        }
        return Promise.reject(error); // Other errors, reject
    }
);

export default axiosInstance;
