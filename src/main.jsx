import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Auth from "./Auth";
import "./i18n";

function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return isLoggedIn ? <App onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
