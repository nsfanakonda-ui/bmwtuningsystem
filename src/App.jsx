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
      const res = await fetch("http://localhost:5000/api/upload");
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        setProgress(100);
        setStatus("success");
        setTimeout(() => {
          setProgress(0);
          setStatus(null);
        }, 3000);
        setFile(null);
        setFileName("");
        fetchFiles();
      } else {
        setStatus("error");
      }
    });

    xhr.addEventListener("error", () => {
      setStatus("error");
    });

    xhr.open("POST", "http://localhost:5000/api/upload");
    xhr.send(formData);
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.originalname
      .toLowerCase()
      .includes(search.toLowerCase());
    const fileKey = getCategoryKey(f.originalname);
    const matchesCategory = categoryFilter === "all" || fileKey === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>{t("title")}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <img
              src={deFlag}
              alt="Deutsch"
              style={{ width: 36, cursor: "pointer" }}
              onClick={() => changeLanguage("de")}
            />
            <img
              src={enFlag}
              alt="English"
              style={{ width: 36, cursor: "pointer" }}
              onClick={() => changeLanguage("en")}
            />
          </div>

          {username && (
            <span style={{ fontSize: 14, color: "#333" }}>
              {t("logged_in_as", { user: username, role: role || "user" })}
            </span>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: "6px 12px",
              background: "#c0392b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("logout")}
          </button>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files[0];
              setFile(f);
              setFileName(f ? f.name : "");
            }}
          />

          <label
            htmlFor="fileInput"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#007bff",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("choose_file")}
          </label>

          {fileName && (
            <span style={{ marginLeft: 10, fontStyle: "italic" }}>
              {fileName}
            </span>
          )}

          <button
            type="submit"
            style={{
              marginLeft: 12,
              padding: "8px 16px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("upload")}
          </button>
        </form>

        {progress > 0 && (
          <div
            style={{
              marginTop: 16,
              width: "100%",
              height: 20,
              borderRadius: 10,
              background: "#ddd",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)",
                transition: "width 0.3s ease-in-out",
              }}
            ></div>
            <span
              style={{
                position: "absolute",
                width: "100%",
                textAlign: "center",
                top: 0,
                left: 0,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {progress}%
            </span>
          </div>
        )}

        {status === "success" && (
          <div style={{ marginTop: 10, color: "green", fontWeight: "bold" }}>
            ✅ {t("upload_success")}
          </div>
        )}
        {status === "error" && (
          <div style={{ marginTop: 10, color: "red", fontWeight: "bold" }}>
            ❌ {t("upload_fail")}
          </div>
        )}

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="all">{t("all_categories")}</option>
            <option value="xdf">{t("categories.xdf")}</option>
            <option value="bin">{t("categories.bin")}</option>
            <option value="archive">{t("categories.archive")}</option>
            <option value="images">{t("categories.images")}</option>
            <option value="documents">{t("categories.documents")}</option>
            <option value="others">{t("categories.others")}</option>
          </select>
        </div>

        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {filteredFiles.map((f) => {
            const catKey = getCategoryKey(f.originalname);
            return (
              <li
                key={f._id}
                style={{
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {f.originalname}{" "}
                    <span style={{ fontSize: 12, color: "#007bff" }}>
                      [{t(`categories.${catKey}`)}]
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(f.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={`http://localhost:5000/api/upload/${f.filename}`}
                    download
                    style={{
                      padding: "6px 12px",
                      background: "#444",
                      color: "white",
                      borderRadius: "4px",
                      textDecoration: "none",
                    }}
                  >
                    {t("download")}
                  </a>
                  {role === "admin" && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `http://localhost:5000/api/upload/${f._id}`,
                            { method: "DELETE" }
                          );
                          if (res.ok) {
                            fetchFiles();
                          } else {
                            alert("Fehler beim Löschen");
                          }
                        } catch (err) {
                          alert("Fehler beim Löschen");
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {t("delete")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default App;
