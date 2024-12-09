import { Request, Response, NextFunction } from "express";
import { IUser, IUserDocument } from "../types/IUser";
import { CustomRequest } from "../middleware/auth";
let User = require("../models/userModel");
let errorResponse = require("../utils/errorResponse");
let sendEmail = require("../utils/sendEmail");
import crypto from "crypto";

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new errorResponse("Email already registered", 400));
  }
  try {
    req.body.role = "user"; // to prevent anyone from creating an admin user
    req.body.active = false; // to prevent anyone from activating a user
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// signin
exports.signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email) {
      return next(new errorResponse("please enter email", 403));
    }
    if (!password) {
      return next(new errorResponse("please enter password", 403));
    }

    // check user email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new errorResponse("Invalid Credentials!", 400));
    }

    //check password
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new errorResponse("Invalid Credentials", 400));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

interface tokenOptions {
  maxAge: number;
  httpOnly: boolean;
  secure?: boolean;
}

const sendTokenResponse = async (
  user: IUserDocument,
  codeStatus: number,
  res: any
) => {
  const token = await user.getJwtToken();
  const options: tokenOptions = { maxAge: 60 * 60 * 1000, httpOnly: true };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(codeStatus)
    .cookie("token", token, options)
    .json({
      Yo: `You are logged in as ${user.firstname}`,
      data: {
        success: true,
        id: user._id,
        role: user.role,
        active: user.active,
      },
    });
};

// log out

exports.logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out!",
  });
};

// user profile

exports.userProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user?.id).select("-password");
  res.status(200).json({
    success: true,
    user,
  });
};

// forgot password

exports.forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new errorResponse("There is no user with this email", 404));
  }

  // get reset token
  // get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //const reset url
  const resetUrl =
    process.env.BASE_URL + `/api/users/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) requested
a password reset. Please click on the link below:<br><br/>
<a rel='noopener noreferrer' target="_blank" href=${resetUrl}>${resetUrl}</a>
<br/> <br/>N.B: The link will expire in 10 minutes, if it wasn't you, ignore thie email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset password",
      message,
    });
    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(error);
  }
};

// reset pasword

exports.resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new errorResponse("Link expired", 400));
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    next();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
