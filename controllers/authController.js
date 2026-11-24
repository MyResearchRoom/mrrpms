const bcrypt = require("bcrypt");
const { User, Client, RefreshToken } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");
const { refresh_jwt_secret } = require("../config/config");
const { where } = require("sequelize");
const { verify } = require("jsonwebtoken");
const { token } = require("morgan");

//generate otp
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const {
      name,
      empId,
      email,
      mobileNumber,
      gender,
      dateOfBirth,
      address,
      pinCode,
      gstNumber,
      role,
      password,
      profile,
    } = req.body;

    if (!name || !email || !mobileNumber || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = null;
    let profileType = null;

    if (req.file) {
      profileImage = req.file.buffer;
      profileType = req.file.mimetype;
    }

    const newUser = await User.create({
      name,
      email,
      mobileNumber,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      pinCode: pinCode || null,
      gstNumber,
      role,
      empId,
      password: hashedPassword,
      profile: profileImage,
      imageType: profileType,
    });

    res.status(201).json({
      success: true,
      message: "User Registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Register User",
    });
  }
};

//also use this api for resend otp
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, Password and role are required",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    if (user.isBlock) {
      return res.status(401).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: " Unauthorized role",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(user.email, "Login Verification OTP", "", otp);

    res.status(200).json({
      success: true,
      message: "Otp sent to your registered email address",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send otp to your registered email address",
    });
  }
};

exports.clientLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, Password and role are required",
      });
    }

    const client = await Client.findOne({ where: { email } });
    if (!client) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    if (client.isBlock) {
      return res.status(401).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    const otp = generateOtp();
    client.otp = otp;
    client.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await client.save();

    await sendEmail(client.email, "Login Verification OTP", "", otp);

    res.status(200).json({
      success: true,
      message: "Otp sent to your registered email address",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send otp to your registered email address",
    });
  }
};

exports.verifyOtpLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and otp are required",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        message: "OTP not generated. Please login again.",
      });
    }

    const currentTime = moment();

    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP.",
      });
    }

    if (currentTime.isAfter(moment(user.otpExpires))) {
      return res.status(401).json({
        message: "OTP has expired. Please login again.",
      });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    //generate token
    const payload = { id: user.id, role: user.role, name: user.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const newRefreshToken = await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: moment().add(7, "days").toDate(),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    let profileImage = null;
    if (user.profile) {
      const mimeType = user.profile?.mime || "image/png";
      profileImage = `data:${mimeType};base64,${user.profile.toString(
        "base64"
      )}`;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified - Login successfull",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: accessToken,
        role: user.role,
        profile: profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Login",
    });
  }
};

exports.verifyOtpClientLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  try {
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    if (!client.otp || !client.otpExpires) {
      return res
        .status(400)
        .json({ message: "OTP not generated. Please login again." });
    }

    const currentTime = moment();

    if (client.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    if (currentTime.isAfter(moment(client.otpExpires))) {
      return res
        .status(401)
        .json({ message: "OTP has expired. Please login again." });
    }

    // Clear OTP after verification
    client.otp = null;
    client.otpExpires = null;
    await client.save();

    //generate token
    const payload = { id: client.id, role: client.role, name: client.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const newRefreshToken = await RefreshToken.create({
      token: refreshToken,
      clientId: client.id,
      expiresAt: moment().add(7, "days").toDate(),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    let profileImage = null;
    if (client.profile) {
      const mimeType = client.profile?.mime || "image/png";
      profileImage = `data:${mimeType};base64,${client.profile.toString(
        "base64"
      )}`;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified - Login successful",
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        token: accessToken,
        role: client.role,
        profile: profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Access denied.",
    });
  }

  try {
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken.token },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // const user = await User.findByPk(storedToken.userId || storedToken.clientId);

    let user = null;
    if (storedToken.userId) {
      user = await User.findByPk(storedToken.userId);
    } else if (storedToken.clientId) {
      user = await Client.findByPk(storedToken.clientId);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = { id: user.id, role: user.role, name: user.name };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    storedToken.isRevoked = true;
    await storedToken.save();

    //    const newRefreshToken = await RefreshToken.create({
    //   token: refreshToken,
    //   userId: user.id,
    //   expiresAt: moment().add(7, "days").toDate(),
    // });

    const getNewToken = await RefreshToken.create({
      token: newRefreshToken,
      userId: storedToken.userId,
      clientId: storedToken.clientId,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.cookie("refreshToken", getNewToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    let profileImage = null;
    if (user.profile) {
      const mimeType = user.profile?.mime || "image/png";
      profileImage = `data:${mimeType};base64,${user.profile.toString(
        "base64"
      )}`;
    }

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileImage,
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All field are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and Confirm Password does not match",
    });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old Password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user;
    if (role === "CLIENT") {
      user = await Client.findByPk(id);
    } else {
      user = await User.findByPk(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileImage = null;
    if (user.profile) {
      const mimeType = user.profile?.mime || "image/png";
      profileImage = `data:${mimeType};base64,${user.profile.toString(
        "base64"
      )}`;
    }

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profile: profileImage,
      },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

exports.logOut = async (req, res) => {
  const userId = req.user.id;
  await RefreshToken.update({ isRevoked: true }, { where: { userId } });
  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.resendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    let user;
    let isClient = false;

    if (role === "CLIENT") {
      user = await Client.findOne({ where: { email } });
      isClient = true;
    } else {
      user = await User.findOne({ where: { email, role } });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlock) {
      return res.status(404).json({
        success: false,
        message: "Your account is blocked. Please contact admin.",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(user.email, "Resent Login Verification Otp", "", otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resent OTP",
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: {
        role: "PROJECT_COORDINATOR",
        isBlock: false,
      },
      attributes: ["id", "name", "isBlock"],
    });

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};
