import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthenticatedError } from "../errors";
import {
  attachCookieToResponse,
  createTokenUser,
  generateUniqueToken,
  sendVerificationEmail,
  sendPasswordResetLink,
} from "../utils";

const BASE_URL = "http://localhost:3000/api/v1";

const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new BadRequestError("Email already exists");
  }
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const generatedToken = await generateUniqueToken();
  const user = await User.create({
    name,
    email,
    password,
    role,
    isEmailVerified: false,
    verificationToken: generatedToken,
  });
  const tokenUser = createTokenUser(user);
  attachCookieToResponse(res, tokenUser);

  const verificationLink = `${BASE_URL}/auth/verify-email/${generatedToken} `;
  sendVerificationEmail(email, verificationLink);

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new UnauthenticatedError("Invalid token");
  }
  user.isEmailVerified = true;
  user.verificationToken = "";
  await user.save();

  res.status(StatusCodes.OK).json({ message: "Email verified" });
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  const tokenUser = createTokenUser(user);
  attachCookieToResponse(res, tokenUser);
  if (!user.isEmailVerified) {
    const verificationLink = `${BASE_URL}/auth/verify-email/${user.verificationToken}`;
    sendVerificationEmail(user.email, verificationLink);
  }

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid email address");
  }
  const resetToken = await generateUniqueToken();
  user.resetToken = resetToken;
  user.tokenExpiryIn = Date.now() + 1000 * 60 * 20;
  await user.save();

  const resetLink = `${BASE_URL}/auth/reset-password/${resetToken}`;
  sendPasswordResetLink(email, resetLink);

  res
    .status(StatusCodes.OK)
    .json({ message: "Password reset link sent to your email." });
};

const passwordReset = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    throw new BadRequestError("Please provide new password");
  }
  const user = await User.findOne({
    resetToken: token,
    tokenExpiryIn: { $gt: Date.now() },
  });
  if (!user) {
    throw new UnauthenticatedError("Invalid or expired token");
  }
  user.password = newPassword;
  user.resetToken = "";
  user.tokenExpiryIn = null;
  await user.save();

  res.status(StatusCodes.OK).json({ message: "Password reset successful" });
};

const logoutUser = (req: Request, res: Response) => {
  res.cookie("token", "none", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(StatusCodes.OK).send({ msg: "User logged out" });
};

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  passwordReset,
};
