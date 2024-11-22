import React from 'react';
import { FcGoogle } from "react-icons/fc";

const GoogleAuth = () => {
  const handleGoogleSignIn = () => {
    const clientId = '608824506431-5gn0rsn54vt3g2bvljmqcjvc448u537v.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8000/auth/google/login/callback/';
    const authUri = 'https://accounts.google.com/o/oauth2/auth';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });

    // Redirect to Google OAuth authorization URL
    window.location.href = `${authUri}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center mt-4" onClick={handleGoogleSignIn}>
      <FcGoogle size={30} />
    </div>
  );
};

export default GoogleAuth;
