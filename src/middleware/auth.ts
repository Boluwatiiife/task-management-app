import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/IUser";
let errorResponse = require("../utils/errorResponse");
let jwt = require("jsonwebtoken");
let User = require("../models/userModel");

export interface CustomRequest extends Request {
  user?: IUser;
}

interface DecodedToken {
  id: string;
}

// check if user is authenticated
exports.isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;

  // make sure token exists
  if (!token) {
    return next(new errorResponse("You must Log in!", 401));
  }
  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    req.user = await User.findById(decoded.id);
    next();
  } catch (error: any) {
    return next(error);
    // return next(new errorResponse("You must Log in!", 401));
  }
};

// middleware for admin
exports.isAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "user") {
    return next(new errorResponse("Access denied, you are not an Admin", 401));
  }
  next();
};
