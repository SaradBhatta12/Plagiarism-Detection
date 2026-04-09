import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from "class-validator";
import { UserRole } from "@/database/entities/User";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password!: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: "Invalid role" })
  role!: UserRole;
}

