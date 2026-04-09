import { NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/database/auth";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "Refresh token is required" }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid or expired refresh token" }, { status: 401 });
    }

    const newAccessToken = generateAccessToken({ id: payload.id, email: payload.email, role: payload.role });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};
