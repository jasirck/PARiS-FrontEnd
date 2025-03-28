// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Base from "./Components/Home/Base";
import AdminBase from "./Components/Admin/Dashboard/AdminBase";
import AdminLogin from "./Components/Admin/AdminLogin";
import Profile from "./Components/Home/Profile/Profile";
import {
  PaymentCancel,
  PaymentSuccess,
} from "./Components/Home/PaymentResult";
import PrivacyPolicy from "./Components/legal/PrivacyPolicy";
import TermsOfService from "./Components/legal/TermsOfService";
import UserDataDeletion from "./Components/legal/UserDataDeletion";


function App() {
  return (
    <>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/*" element={<Base />} />
            <Route path="/home" element={<Base />} />
            <Route path="/profile/*" element={<Profile />} />
            <Route path="/admin/*" element={<AdminBase />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/cancel" element={<PaymentCancel />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/user-data-deletion" element={<UserDataDeletion />} />
          </Routes>
        </Router>
      
    </>
  );
}

export default App;
