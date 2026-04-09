import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { User, UserRole } from "@/database/entities/User";
import { hashPassword, generateAccessToken, generateRefreshToken } from "@/database/auth";
import { validateDto } from "@/database/validation";
import { RegisterDto } from "@/database/dto/register.dto";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { data, errors } = await validateDto(RegisterDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = await getDb();
    const userRepository = db.getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password);
    const user = userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });


    await userRepository.save(user);

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};
