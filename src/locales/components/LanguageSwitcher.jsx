import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div style={{ position: "absolute", top: 10, left: 10 }}>
      <img
        src="https://flagcdn.com/de.svg"
        alt="Deutsch"
        width="32"
        style={{ cursor: 'pointer', marginRight: 8, border: i18n.language === "de" ? "2px solid #222" : "none" }}
        onClick={() => i18n.changeLanguage('de')}
      />
      <img
        src="https://flagcdn.com/gb.svg"
        alt="English"
        width="32"
        style={{ cursor: 'pointer', border: i18n.language === "en" ? "2px solid #222" : "none" }}
        onClick={() => i18n.changeLanguage('en')}
      />
    </div>
  );
};

export default LanguageSwitcher;