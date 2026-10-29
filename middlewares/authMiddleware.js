const jwt = require("jsonwebtoken");
const { User, Client } = require("../models");
const { access_jwt_secret } = require("../config/config");

// Role-based authentication middleware
const authenticate = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Token is missing.",
        });
      }

      const decoded = jwt.verify(token, access_jwt_secret);

      console.log(decoded);

      let user = null;

      if (decoded.role === "CLIENT") {
        user = await Client.findByPk(decoded.id, {
          attributes: [
            "id",
            "name",
            "email",
            "mobileNumber",
            "role",
            "isBlock",
          ],
        });
      } else {
        user = await User.findByPk(decoded.id);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found.",
        });
      }
      if (user.isBlock) {
        return res.status(401).json({
          success: false,
          message:
            "Access is restricted. Please contact your administrator for assistance.",
          data: {
            block: true,
          },
        });
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You do not have access to this resource.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Token has expired.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Invalid token.",
        });
      }

      res.status(500).json({
        message: "Internal Server Error. Authentication failed.",
        success: false,
      });
    }
  };
};

module.exports = authenticate;
