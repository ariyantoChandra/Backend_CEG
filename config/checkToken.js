import jwt from "jsonwebtoken";

const checkToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, expired: true, decoded: null };
    }
    return { valid: false, expired: false, decoded: null };
  }
};


export default checkToken;
