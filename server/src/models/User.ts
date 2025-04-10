import { model, Schema, Document } from "mongoose";
import { IUser} from "../types/types";
import {
  comparePassword,
  generatePasswordResetToken,
  hashPassword,
} from "../utils/authUtil";

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
   

    otpExpires: {
      type: Date,
      select: false,
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    preferences: {
      theme: {
        type: String,
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    passwordResetExpires: Date,
    passwordResetToken: String,
  },

  {
    timestamps: true,
  }
);

userSchema.pre<IUser & Document>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.createPasswordResetToken = function () {
  const { resetToken, hashedToken, expires } = generatePasswordResetToken();
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expires;
  return resetToken;
};
// check if password reset token is valid
userSchema.methods.isResetTokenValid = function () {
  return this.passwordResetExpires && this.passwordResetExpires > new Date();
};
userSchema.methods.isOtpValid = function () {
  return this.otpExpires && this.otpExpires > new Date();
};

export const User = model<IUser>("User", userSchema);