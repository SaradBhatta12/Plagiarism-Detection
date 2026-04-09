import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { User } from "@/database/entities/User";
import { verifyAccessToken, hashPassword } from "@/database/auth";
import { validateDto } from "@/database/validation";
import { UpdateUserDto } from "@/database/dto/update-user.dto";

export const GET = async (request: Request) => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const db = await getDb();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.id } });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();
    const { data, errors } = await validateDto(UpdateUserDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = await getDb();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.id } });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (data.name) user.name = data.name;
    if (data.email) {
      const existingUser = await userRepository.findOne({ where: { email: data.email } });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ success: false, message: "Email already taken" }, { status: 400 });
      }
      user.email = data.email;
    }
    if (data.password) {
      user.password = await hashPassword(data.password);
    }

    await userRepository.save(user);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};


// logout
export const POST = async (request: Request) => {
  try {

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.set("token", "", { expires: new Date(0), path: "/" });
    response.cookies.set("user", "", { expires: new Date(0), path: "/" });
    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};