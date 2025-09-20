const API_URL = import.meta.env.VITE_API_URL;

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import deFlag from "./assets/flags/de.png";
import enFlag from "./assets/flags/en.png";

function getCategoryKey(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "xdf") return "xdf";
  if (ext === "bin") return "bin";
  if (["zip", "rar", "7z"].includes(ext)) return "archive";
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "images";
  if (["pdf"].includes(ext)) return "documents";
  return "others";
}

function App() {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/upload`);
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0]?.name || "");
  };

  const handleUpload = () => {
    if (!file) return;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          setStatus("✅ Upload erfolgreich");
          fetchFiles();
        } else {
          setStatus("❌ Fehler beim Upload");
        }
      }
    };

    xhr.open("POST", `${API_URL}/upload`);
    xhr.send(formData);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/upload/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      fetchFiles();
    } catch (err) {
      console.error("❌ Delete Error:", err);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.filename.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || getCategoryKey(f.filename) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="App">
      {/* Sprachen */}
      <div className="language-switch">
        <img src={deFlag} alt="Deutsch" onClick={() => changeLanguage("de")} />
        <img src={enFlag} alt="English" onClick={() => changeLanguage("en")} />
      </div>

      <h1>{t("fileSystemTitle")}</h1>

      {/* Upload */}
      {role === "admin" && (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>{t("upload")}</button>
          {fileName && <p>{fileName}</p>}
          {progress > 0 && <progress value={progress} max="100">{progress}%</progress>}
          {status && <p>{status}</p>}
        </div>
      )}

      {/* Suche & Filter */}
      <input
        type="text"
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
        <option value="all">{t("all")}</option>
        <option value="xdf">XDF</option>
        <option value="bin">BIN</option>
        <option value="archive">{t("archive")}</option>
        <option value="images">{t("images")}</option>
        <option value="documents">{t("documents")}</option>
        <option value="others">{t("others")}</option>
      </select>

      {/* Datei-Liste */}
      <ul>
        {filteredFiles.map((f) => (
          <li key={f._id}>
            <a href={`${API_URL}/upload/${f.filename}`} target="_blank" rel="noreferrer">
              {f.filename}
            </a>
            {role === "admin" && (
              <button onClick={() => handleDelete(f._id)}>❌</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
