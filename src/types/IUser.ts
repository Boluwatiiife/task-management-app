import { Document } from "mongoose";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword: () => Promise<boolean>;
  getJwtToken: () => string;
  getResetPasswordToken: () => string;
}
