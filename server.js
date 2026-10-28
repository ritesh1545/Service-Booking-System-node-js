require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Service Booking API is running",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  const requiredEnv = [
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
  );

  if (missingEnv.length) {
    console.error("Missing environment variables:", missingEnv.join(", "));
    process.exit(1);
  }

  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();