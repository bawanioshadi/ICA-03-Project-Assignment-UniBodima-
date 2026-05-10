import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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
//login function
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ status: "fail", message: "All fields required" });
    }

  
    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { name: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ status: "fail", message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: "fail", message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      status: "success",
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) return res.status(400).json({ status: "fail", message: "Phone in use" });
      user.phone = phone;
    }
    if (name) user.name = name;
    await user.save();
    res.json({ status: "success", user: { _id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) { res.status(500).json({ status: "fail", message: err.message }); }
};

