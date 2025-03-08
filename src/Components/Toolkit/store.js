import { configureStore } from '@reduxjs/toolkit';
import authSlice from './Slice/authSlice';
import apiSlice from './Slice/apiHomeSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    api : apiSlice,
  },
});

export default store;
