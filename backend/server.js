require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");

const app = express();
app.use(cors());
app.use(express.json());

// Statische Dateien bereitstellen (Downloads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => res.send("✅ API läuft!"));

// MongoDB Verbindung
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB verbunden");
    app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Fehler:", err));
