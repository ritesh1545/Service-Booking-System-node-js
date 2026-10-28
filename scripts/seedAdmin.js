
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function seedAdmin() {
  try {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "MONGO_URI, ADMIN_EMAIL aur ADMIN_PASSWORD .env mein required hain"
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password kam se kam 12 characters ka hona chahiye");
    }

    await mongoose.connect(MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    let admin = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (admin) {
      admin.role = "admin";
      admin.password = hashedPassword;
      await admin.save();

      console.log("Admin role and password updated successfully");
    } else {
      await User.create({
        username: "Administrator",
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created successfully");
    }
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedAdmin();
