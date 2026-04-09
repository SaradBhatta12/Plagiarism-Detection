import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { User } from "@/database/entities/User";
import { comparePassword, generateAccessToken, generateRefreshToken } from "@/database/auth";
import { validateDto } from "@/database/validation";
import { LoginDto } from "@/database/dto/login.dto";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { data, errors } = await validateDto(LoginDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = await getDb();
    const userRepository = db.getRepository(User);

    const user = await userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("token", accessToken, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};
