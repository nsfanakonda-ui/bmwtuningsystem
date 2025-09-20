const API_URL = import.meta.env.VITE_API_URL;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import deFlag from "./assets/flags/de.png";
import enFlag from "./assets/flags/en.png";
import "./Auth.css";

function Auth({ onLogin }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? `${API_URL}/auth/register`
      : `${API_URL}/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "❌ Fehler");
        return;
      }

      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      setMessage("✅ Login erfolgreich");
      onLogin();
    } catch (err) {
      setMessage("❌ Netzwerkfehler");
      console.error("Auth Error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="language-switch">
        <img src={deFlag} alt="Deutsch" onClick={() => handleLanguageChange("de")} />
        <img src={enFlag} alt="English" onClick={() => handleLanguageChange("en")} />
      </div>

      <h2>{isRegister ? t("register") : t("login")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isRegister ? t("register") : t("login")}
        </button>
      </form>

      <p onClick={() => setIsRegister(!isRegister)} className="toggle">
        {isRegister ? t("haveAccount") : t("noAccount")}
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Auth;
