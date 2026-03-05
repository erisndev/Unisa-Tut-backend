const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Unisa Tut API is running");
});

// MongoDB connection

const connectDB = require("./config/db");
connectDB();

// Routes

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
