// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Base from './Components/Home/Base'; // Ensure this path points to your Base component
import AdminBase from './Components/Admin/Dashboard/AdminBase';
import AdminLogin from './Components/Admin/AdminLogin';
import Profile from './Components/Home/Profile/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/*" element={<Base />} />
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/admin/*" element={<AdminBase />} />
        <Route path='/adminlogin' element={<AdminLogin/>}/>
      </Routes>
    </Router>
  );
}

export default App;

