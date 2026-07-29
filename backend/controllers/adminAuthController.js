const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { generateToken } = require("../utils/jwt");

const loginAdmin = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const result = await pool.query(
      `
        SELECT
          user_id,
          user_name,
          password,
          role,
          theme
        FROM users
        WHERE user_name = $1
      `,
      [user_name.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    if (user.role !== "Admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = generateToken({
      user_id: user.user_id,
      user_name: user.user_name,
      role: user.role,
    });

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCurrentAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          user_id,
          user_name,
          role,
          theme
        FROM users
        WHERE user_id = $1
      `,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Admin user not found",
      });
    }

    const user = result.rows[0];

    if (user.role !== "Admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current admin error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
};