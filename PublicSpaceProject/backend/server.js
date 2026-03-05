require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ROUTES
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const friendRoutes = require("./routes/friend");

// MIDDLEWARE
const authMiddleware = require("./middleware/authMiddleware");

const app = express();


// ===== GLOBAL MIDDLEWARE =====
app.use(cors());
app.use(express.json());


// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);


// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Public Space Backend Running");
});


// ===== PROTECTED ROUTE =====
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    userId: req.userId
  });
});


// ===== MONGODB CONNECTION =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });


// ===== START SERVER =====
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});