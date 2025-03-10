import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: localStorage.getItem('user') || null,
    token: localStorage.getItem('token') || null,
    refresh_token: localStorage.getItem('refresh_token') || null,  
    is_admin: localStorage.getItem('is_admin') || null,
    profile: localStorage.getItem('profile') || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refresh_token = action.payload.refresh_token; 
            state.is_admin = action.payload.is_admin;
            state.profile = action.payload.profile;

            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refresh_token', action.payload.refresh_token); 
            localStorage.setItem('user', action.payload.user);
            localStorage.setItem('is_admin', action.payload.is_admin);
            localStorage.setItem('profile', action.payload.profile);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refresh_token = null; 
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token'); 
            localStorage.removeItem('user');
            localStorage.removeItem('is_admin');
            localStorage.removeItem('profile');
        },
        updateToken: (state, action) => {
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        },
    },
});

export const { login, logout,updateToken } = authSlice.actions;
export default authSlice.reducer;
