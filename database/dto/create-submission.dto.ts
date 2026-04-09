import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateSubmissionDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
