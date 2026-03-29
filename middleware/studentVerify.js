import {
  isValidStudentId,
  getStudentIdError,
} from "../utils/studentIdValidator.js";

const studentVerify = (req, res, next) => {
  const { studentId } = req.body;

  if (!studentId || studentId.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Student ID is required.",
    });
  }

  if (!isValidStudentId(studentId.trim())) {
    return res.status(400).json({
      success: false,
      message: getStudentIdError(),
    });
  }

  next();
};

export default studentVerify;
