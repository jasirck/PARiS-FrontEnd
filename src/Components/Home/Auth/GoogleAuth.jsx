import { FcGoogle } from "react-icons/fc";
import React from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../Toolkit/Slice/authSlice";

function GoogleAuth({ setIsModal }){
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;

      try {
        // Fetch user info from Google
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const userInfo = userInfoResponse.data;
        console.log(userInfo);

        // Send user info to your backend for login/registration
        const backendResponse = await axios.post(
          "http://127.0.0.1:8000/api/auth/google/",
          { user: userInfo }
        );

        const { token, user, is_admin, profile } = backendResponse.data;
        console.log(token);
        

        // Dispatch login action to Redux
        dispatch(
          login({
            token,
            user,
            is_admin,
            profile,
          })
        );
        setIsModal('')
        navigate("/"); // Redirect to home page
      } catch (error) {
        console.error(
          "Error during authentication:",
          error.response?.data || error.message
        );
        alert("Authentication failed. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
    },
    scope: "openid profile email",
  });

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={handleGoogleLogin}
      >
        <FcGoogle size={24} className="mr-2" />
      </button>
    </div>
  );
};

export default GoogleAuth;
