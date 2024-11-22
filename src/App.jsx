// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Base from './Components/Home/Base'; // Ensure this path points to your Base component
import AdminBase from './Components/Admin/Dashboard/Base';
import AdminLogin from './Components/Admin/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/*" element={<Base />} />
        <Route path="/admin" element={<AdminBase />} />
        <Route path='/adminlogin' element={<AdminLogin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
