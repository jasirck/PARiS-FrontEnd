import axios from 'axios';
import { logout, login,updateToken } from '../Components/Toolkit/Slice/authSlice'; 
import store from '../Components/Toolkit/store'; 

const axiosInstance = axios.create({
    baseURL: "https://api.paristoursandtravels.in/", 
    headers: {
        "Content-Type": "application/json",
    },
});

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

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh_token = localStorage.getItem('refresh_token');
            console.log(refresh_token);
            if (refresh_token) {
                try {
                    const refreshResponse = await axios.post('https://api.paristoursandtravels.in/api/token/refresh/', {
                        refresh_token: refresh_token
                    });

                    const newAccessToken = refreshResponse.data.access;

                    localStorage.setItem('token', newAccessToken);
                    console.log('newAccessToken', newAccessToken);
                    
                    store.dispatch(updateToken({ token: newAccessToken }));

                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                } catch (err) {
                    store.dispatch(logout());
                    return Promise.reject(err); 
                }
            } else { 
                store.dispatch(logout());
                localStorage.clear(); 
                return Promise.reject(error); 
            }
        }
        return Promise.reject(error); 
    }
);

export default axiosInstance;
