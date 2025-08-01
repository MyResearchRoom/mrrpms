const { access_jwt_secret, refresh_jwt_secret } = require("../config/config");
const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) =>
  jwt.sign(payload, access_jwt_secret, {
    expiresIn: "10m",
  });

exports.generateRefreshToken = (payload) =>
  jwt.sign(payload, refresh_jwt_secret, {
    expiresIn: "7d",
  });