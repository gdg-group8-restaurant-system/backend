const jwt = require("jsonwebtoken");

const generateTokens = (userId, role) => {
  // Short-lived access token — sent in response body
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" },
  );

  // Long-lived refresh token — sent as httpOnly cookie
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" },
  );

  return { accessToken, refreshToken };
};

// Attaches refresh token as httpOnly cookie to the response
const attachRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

module.exports = { generateTokens, attachRefreshTokenCookie };
