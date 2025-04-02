import { Response, Request, NextFunction } from "express";
import Crypto from "crypto";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { User } from "../models/User";
import { Workspace } from "../models/Workspace";
import { generateAccessToken } from "../utils/tokenUtil";
import { loginSchema, signupSchema } from "../validators/validatorSchema";
import sendEmail from "../utils/sendEmail";
import { generateCode } from "../utils/generator";

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = signupSchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const {
      firstName,
      lastName,
      email: rawEmail,
      password,
    } = parsedResult.data;

    const email = rawEmail.toLowerCase().trim();
    const isUserExist = await User?.findOne({ email });
    if (isUserExist) {
      return next(new HttpError("User already exists", 400));
    }

    try {
      const otp = generateCode(4);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Create user regardless of email success
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        otp,
        otpExpires,
      });


      const personalWorkspace = await Workspace.create({
        name: `${firstName}'s Workspace`,
        description: "Your personal workspace",
        ownerId: user._id,
        isPersonal: true,
        color: "#6366F1", 
        icon: "home",
      });

      const data = {
        user: { name: user.firstName, email: user.email },
        otp: otp,
      };

      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome to NestedTask - Verify Your Email",
          template: "activation",
          date: data,
        });

        res.status(201).json({
          status: "success",
          message: "Account created! Please verify your email to continue.",
          email: user.email,
          workspace: {
            id: personalWorkspace._id,
            name: personalWorkspace.name,
          },
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);

 
        res.status(201).json({
          status: "success",
          message:
            "Account created but verification email failed. Please contact support.",
          email: user.email,
          workspace: {
            id: personalWorkspace._id,
            name: personalWorkspace.name,
          },
        });
      }
    } catch (error) {
      console.error("Error in signup process:", error);
      return next(new HttpError("Failed to create your account", 500));
    }
  }
);
/**
 * Verify email with OTP
 */
export const verifyOtp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email: rawEmail, otp } = req.body;
    if (!rawEmail || !otp) {
      return next(
        new HttpError("Email and verification code are required", 400)
      );
    }
    const email = rawEmail.toLowerCase().trim();
    try {
      const user = await User.findOne({ email }).select("+otp +otpExpires");

      if (!user) {
        return next(new HttpError("No account found with this email", 404));
      }
      if (!user.otp || !user.otpExpires) {
        return next(
          new HttpError("Verification code not found or already used", 400)
        );
      }
   
      if (user.otpExpires < new Date()) {
        return next(new HttpError("Verification code has expired", 400));
      }
    
      if (user.otp !== otp) {
        return next(new HttpError("Invalid verification code", 400));
      }


      user.emailVerified = true;

    
      user.otp = undefined;
      user.otpExpires = undefined;

      await user.save({ validateBeforeSave: false });
      const accessToken = generateAccessToken({
        id: user._id as unknown as string | number,
      });
      const userData = user.toObject();
      if ("password" in userData) {
        delete (userData as { password?: string }).password;
      }
      delete userData.otp;
      delete userData.otpExpires;

      res.status(200).json({
        status: "success",
        message: "Email verified successfully",
        data: {
          user: userData,
          accessToken,
        },
      });
    } catch (err) {
      console.error("Error verifying email:", err);
      return next(new HttpError("Verification process failed", 500));
    }
  }
);

/**
 * Request new OTP for email verification
 */
export const requestNewOtp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email: rawEmail } = req.body;
    if (!rawEmail) {
      return next(new HttpError("Email is required", 400));
    }
    const email = rawEmail.toLowerCase().trim();
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return next(new HttpError("No account found with this email", 404));
      }

      if (user.emailVerified) {
        return next(new HttpError("Your email is already verified", 400));
      }
      const newOTP = generateCode(4);
      user.otp = newOTP;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await user.save({ validateBeforeSave: false });
      const data = {
        user: { name: user.firstName, email: user.email },
        otp: newOTP,
      };

      await sendEmail({
        email: user.email,
        subject: "NestedTask - New Verification Code",
        template: "activation",
        date: data,
      });

      res.status(200).json({
        status: "success",
        message: "New verification code sent to your email",
        email: user.email,
      });
    } catch (err) {
      console.error("Error resending verification code:", err);
      return next(new HttpError("Failed to send new verification code", 500));
    }
  }
);

/**
 * User login
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = loginSchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }
    const { email, password } = parsedResult.data;
    const user = await User.findOne({ email }).select(
      "+password +emailVerified"
    );
    if (!user) {
      return next(new HttpError("Invalid email or password", 401));
    }
    if (!user.password) {
      return next(new HttpError("Invalid email or password", 401));
    }
    const isPasswordMatch = await user.comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return next(new HttpError("Invalid email or password", 401));
    }
    if (!user.emailVerified) {
      return next(
        new HttpError("Please verify your email before logging in", 401)
      );
    }
    if (!user.isActive) {
      return next(new HttpError("Your account has been deactivated", 401));
    }

    const accessToken = generateAccessToken({
      id: user._id as unknown as string | number,
    });


    const workspaces = await Workspace.find({
      $or: [
        { ownerId: user._id },
  
      ],
    })
      .sort({ isPersonal: -1, updatedAt: -1 })
      .limit(10);

    const { password: _, __v, ...rest } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      data: {
        user: rest,
        accessToken,
        workspaces,
      },
    });
  }
);

/**
 * Reset password with token
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new HttpError("Password is required", 400));
    }

    const resetToken = Crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return next(new HttpError("Invalid or expired reset link", 400));
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const accessToken = generateAccessToken({
      id: user._id as unknown as string | number,
    });

    res.status(200).json({
      status: "success",
      message: "Your password has been reset successfully",
      data: { accessToken },
    });
  }
);

/**
 * Forgot password - send reset email
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      return next(new HttpError("Email is required", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        status: "success",
        message:
          "If an account with that email exists, we've sent password reset instructions",
      });
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;
    const data = {
      user: { name: user.firstName, email: user.email },
      resetUrl,
    };

    try {
      await sendEmail({
        email: user.email,
        subject: "NestedTask - Password Reset Instructions",
        template: "passwordreset",
        date: data,
      });

      res.status(200).json({
        status: "success",
        message:
          "If an account with that email exists, we've sent password reset instructions",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Error sending password reset email:", error);
      return next(new HttpError("Failed to send password reset email", 500));
    }
  }
);

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new HttpError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  }
);

/**
 * Update user preferences
 */
export const updatePreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { theme, notifications } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "preferences.theme": theme,
        "preferences.notifications": notifications,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new HttpError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Preferences updated successfully",
      data: { preferences: updatedUser.preferences },
    });
  }
);