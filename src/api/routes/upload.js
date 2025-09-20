const express = require("express");
const fs = require("fs");
const path = require("path");
const File = require("../models/File");

const router = express.Router();

// Datei löschen (nur Admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Datei aus DB finden
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: "Datei nicht gefunden" });
    }

    // Datei vom Filesystem löschen
    const filePath = path.join(__dirname, "../uploads", file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Datei aus DB löschen
    await File.findByIdAndDelete(id);

    res.json({ message: "Datei gelöscht" });
  } catch (err) {
    console.error("❌ Fehler beim Löschen:", err);
    res.status(500).json({ message: "Server Fehler beim Löschen" });
  }
});

module.exports = router;
