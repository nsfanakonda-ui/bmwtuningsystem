const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Universelles Admin-Passwort aus .env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "meinSuperAdminPasswort";

// Registrierung
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Bitte Username und Passwort angeben" });
    }

    // Admin darf man nicht registrieren (sondern nur einloggen)
    if (username === "admin") {
      return res.status(400).json({ message: "Admin kann nicht registriert werden" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzername existiert bereits" });
    }

    const hashedPw = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPw, role: "user" });
    await user.save();

    res.status(201).json({ message: "User erfolgreich registriert" });
  } catch (err) {
    console.error("❌ Fehler bei Registrierung:", err);
    res.status(500).json({ message: "Server Fehler" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Himburg.1";
	
    // Admin-Login prüfen
    if (username === "admin" && password === ADMIN_PASSWORD) {
      return res.json({
        token: "fake-jwt-token",
        username: "admin",
        role: "admin",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Ungültige Zugangsdaten" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ungültige Zugangsdaten" });
    }

    res.json({
      token: "fake-jwt-token",
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Fehler beim Login:", err);
    res.status(500).json({ message: "Server Fehler" });
  }
});

module.exports = router;
