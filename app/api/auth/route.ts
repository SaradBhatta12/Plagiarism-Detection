import { NextResponse } from "next/server"
export const GET = async () => {
  try {
    return NextResponse.json({
      message: "Hello World",
      status: 200,
      success: true,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      message: "Failed to fetch auth",
      status: 500,
      success: false,
    })
  }
}