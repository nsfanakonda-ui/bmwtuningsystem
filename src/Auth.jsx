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
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

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

      if (isRegister) {
        setMessage("✅ Registrierung erfolgreich, bitte einloggen.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        onLogin();
      }
    } catch (err) {
      console.error("❌ Auth Error:", err);
      setMessage("❌ Serverfehler");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Sprachumschaltung */}
        <div className="lang-switch">
          <img
            src={deFlag}
            alt="Deutsch"
            onClick={() => handleLanguageChange("de")}
          />
          <img
            src={enFlag}
            alt="English"
            onClick={() => handleLanguageChange("en")}
          />
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

        {message && <p className="auth-message">{message}</p>}

        {/* Umschalt-Button */}
        <p
          className="toggle-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? t("have_account") : t("no_account")}
        </p>
      </div>
    </div>
  );
}

export default Auth;
