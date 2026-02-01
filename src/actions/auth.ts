"use server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { userCredentials, users, userTempCredentials } from "@/db/schema";
import argon2 from "argon2";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { Resend } from "resend";
import db from "@/db";
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!;
// Email transporter
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function registerAction(formData: FormData) {
  try {
    const schema = z.object({
      name: z.string().min(1, "Name is required").max(50),
      email: z.string().email("Invalid email"),
      phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
      password: z.string().min(8, "Password must be 8+ characters"),
    });

    const data = schema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    });

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, message: "User already exists" };
    }

    // Hash password
    const hashedPassword = await argon2.hash(data.password);

    // Create user (not verified)
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .returning();

    await db.insert(userCredentials).values({
      passwordHash: hashedPassword,
      userId: newUser.id,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await db.insert(userTempCredentials).values({
      userId: newUser.id,
      otpHash: otp,
      expiresAt: otpExpiry,
    });

    // Send OTP email
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: data.email,
      subject: "Verify Your Email - yellowchilli",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="font-size: 32px; color: #2563eb; margin: 0;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });

    // Store user ID in session/cookies for verification step
    (await cookies()).set("_auth_verification", newUser.id.toString(), {
      httpOnly: true,
      maxAge: 10 * 60, // 10 minutes
    });

    return { success: true, message:"OTP sent successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Registration failed. Try again.",
    };
  }
}

export async function verifyOtpAction(formData: FormData) {
  try {
    const schema = z.object({
      pin: z.string().length(6, "OTP must be 6 digits"),
    });

    const data = schema.parse({
      pin: formData.get("pin"),
    });

    const pendingUserId = (await cookies()).get("_auth_verification")?.value;

    if (!pendingUserId) {
      return { success: false, message: "Session expired. Please register again." };
    }

    // Find OTP
    const otpRecord = await db
      .select()
      .from(userTempCredentials)
      .where(
        and(
          eq(userTempCredentials.userId, pendingUserId),
          eq(userTempCredentials.otpHash, data.pin),
          gt(userTempCredentials.expiresAt, new Date()), // OTP still valid
        ),
      )
      .limit(1);

    if (otpRecord.length === 0) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    // Verify user
    await db
      .update(users)
      .set({ isActive: true, emailVerified: true })
      .where(eq(users.id, pendingUserId));

    // Delete used OTP
    await db
      .delete(userTempCredentials)
      .where(eq(userTempCredentials.userId, pendingUserId));

    // Generate JWT token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, pendingUserId))
      .limit(1);

      if (!JWT_SECRET) {
      return { success: false, message: "Server configuration error" };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set auth cookies
    (await cookies()).set("_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Clear pending verification
    (await cookies()).delete("_auth_verification");

    return { success: true };
  } catch (error) {
      return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "OTP verification failed",
    };
  }
}

export async function loginAction(formData: FormData) {
  try {
    const schema = z.object({
      email: z.string().trim().email("Please enter a valid email"),
      password: z.string().trim().min(1, "Password is required"),
    });

    const data = schema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (!user || !user.isActive || !user.emailVerified) {
 return {
        success: false,
        message: "Account not found or not verified",
      };    }

    const [password] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, user.id));

    const isPasswordCorrect = await argon2.verify(
      password.passwordHash,
      data.password,
    );

    if (!isPasswordCorrect) {
      return { success: false, message: "Invalid password" };
    }

     if (!JWT_SECRET) {
      return { success: false, message: "Server configuration error" };
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );


    (await cookies()).set("_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function loginWithOtp(formData: FormData) {
  try {
    const schema = z.object({
      email: z.string().min(10),
    });

    const data = schema.parse({
      email: formData.get("email"),
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (!user || !user.emailVerified || !user.isActive) {
return {
        success: false,
        message: "User not found or account not verified",
      };    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await db.insert(userTempCredentials).values({
      userId: user.id,
      otpHash: otp,
      expiresAt: otpExpiry,
    });

    // Send OTP email
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: data.email,
      subject: "Verify Your Email - FoodieHub",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="font-size: 32px; color: #2563eb; margin: 0;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });

    // Store user ID in session/cookies for verification step
    (await cookies()).set("_auth_verification", user.id.toString(), {
      httpOnly: true,
      maxAge: 10 * 60, // 10 minutes
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send OTP",
    };
  }
}

export async function getUserInfo() {
  try {
    const token = (await cookies()).get("_auth_token")?.value;

    const data = await verifyToken(token as string);

    if (!data) {
      return { isAuthn: false, user: null };
    }

    const tokenData = data as { userId: string };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenData.userId));

    if (!user || !user.isActive) {
      return { isAuthn: false, user: null };
    }

    return { isAuthn: true, user };
  } catch (error) {
    return { isAuthn: false, user: null };

  }
}

export async function logoutAction() {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies();
    cookieStore.delete("_auth_token");
    cookieStore.delete("_auth_verification");
    return { success: true };
  } catch (error) {
    return { success: false };

  }
}
export async function verifyToken(token: string) {
  try {
    const data = jwt.verify(token, JWT_SECRET);
    return data;
  } catch {
    return false;
  }
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    const schema = z.object({
      email: z.string().trim().email("Please enter a valid email"),
    });

    const data = schema.parse({
      email: formData.get("email"),
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (!user || !user.emailVerified || !user.isActive) {
      return {success:false,message:"No verified account found with this email"}
    }

    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: "password_reset",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.insert(userTempCredentials).values({
      userId: user.id,
      tokenHash: hashedToken,
      expiresAt: resetExpiry,
    });

    // Send reset email with token link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: data.email,
      subject: "Reset Your yellowchilli Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Reset Password
            </a>
          </div>
          <p><small>This link expires in 1 hour. If you didn't request this, please ignore this email.</small></p>
        </div>
      `,
    });

    return {success:true};
  } catch (error) {
     return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send OTP",
    };
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const schema = z.object({
      password: z.string().trim().min(8, "Password must be 8+ characters"),
      token: z.string().min(1, "Reset token required"),
    });

    const data = schema.parse({
      password: formData.get("password"),
      token: formData.get("token"),
    });

     if (!JWT_SECRET) {
      return { success: false, message: "Server error" };
    }

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(data.token, JWT_SECRET) as  {
      userId: string;
      purpose: string;
    };
    } catch {
      return { success: false, message: "Invalid or expired token" };
    }

    // Verify reset token
    if (payload.purpose !== "password_reset") {
      return { success: false, message: "Invalid reset token" };
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(data.token)
      .digest("hex");

    const tokenRecord = await db
      .select()
      .from(userTempCredentials)
      .where(
        and(
          eq(userTempCredentials.userId, payload.userId),
          eq(userTempCredentials.tokenHash, hashedToken),
          gt(userTempCredentials.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return { success: false, message: "Reset token expired or used" };
    }

    const hashedPassword = await argon2.hash(data.password);

    await db.update(userCredentials).set({
      passwordHash:hashedPassword
    }).where(eq(userCredentials.userId,payload.userId))

    await db
      .delete(userTempCredentials)
      .where(eq(userTempCredentials.tokenHash, data.token));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    const newAuthToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set auth cookie
    (await cookies()).set("_auth_token", newAuthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    return { success: true };
  } catch (error) {
        return { success: false, message: "Password reset failed" };
  }
}
