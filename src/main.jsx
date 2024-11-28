import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./Components/Toolkit/store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = "933508170564-56vnvehvikmso4va018bida4sdiv0r39.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
   <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
  </Provider>
);
