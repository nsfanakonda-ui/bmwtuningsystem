import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../../schemas/User.js";

let conn = null;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  if (!conn) {
    conn = await mongoose.connect(process.env.MONGO_URI);
  }

  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: "Benutzer existiert bereits" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role: "user" });
  await user.save();

  return res.json({ username: user.username, role: user.role });
}
