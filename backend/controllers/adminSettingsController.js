const pool = require("../config/database");

const getAdminTheme = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT theme
        FROM users
        WHERE user_id = $1
          AND role = 'Admin'
      `,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      theme: result.rows[0].theme,
    });
  } catch (error) {
    console.error("Get admin theme error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateAdminTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!["Light", "Dark"].includes(theme)) {
      return res.status(400).json({
        message: "Theme must be Light or Dark",
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET theme = $1
        WHERE user_id = $2
          AND role = 'Admin'
        RETURNING user_id, user_name, theme
      `,
      [theme, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      message: "Theme updated successfully",
      theme: result.rows[0].theme,
    });
  } catch (error) {
    console.error("Update admin theme error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAdminTheme,
  updateAdminTheme,
};