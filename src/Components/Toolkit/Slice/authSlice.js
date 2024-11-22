import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: localStorage.getItem('user') || null,
    token: localStorage.getItem('token') || null,
    is_admin : localStorage.getItem('is_admin') || null
  };
  
  const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      login: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token; 
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', action.payload.user);
        localStorage.setItem('is_admin', action.payload.is_admin);
      },
      logout: (state) => {
        state.user = null;
        state.token = null; 
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('is_admin');
      },
    },
  });
  
  export const { login, logout } = authSlice.actions;
  export default authSlice.reducer;