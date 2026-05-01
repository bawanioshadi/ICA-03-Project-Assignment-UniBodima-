import User from "../models/User.js";
import bcrypt from "bcryptjs";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ status: "fail", message: "All fields are required" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "Phone number already registered" });
    }

    if (!["student", "owner"].includes(role)) {
      return res.status(400).json({ status: "fail", message: "Invalid role" });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: "fail", message: "Password must be at least 6 characters" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ status: "fail", message: "Phone number must be 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);//password hashed pasword created 

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role
    });

    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        user
    });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};