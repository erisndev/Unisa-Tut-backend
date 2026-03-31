 const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    if (!adminUser || !adminPass) {
      return res.status(500).json({ message: "Admin credentials not configured" });
    }

    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "admin", username },
      secret,
      { expiresIn: "8h" }
    );

    res.json({ token, role: "admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
