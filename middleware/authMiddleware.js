export default (req, res, next) => {
  // TEMP: simulate authenticated user
  req.user = {
    id: "65f0c2f4a1234567890abcd", // dummy ObjectId
    role: "student",
    isVerified: true,
  };

  next();
};