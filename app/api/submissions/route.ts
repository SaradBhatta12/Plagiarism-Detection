import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { User, UserRole } from "@/database/entities/User";
import { Assignment } from "@/database/entities/Assignment";
import { Submission } from "@/database/entities/Submission";
import { verifyAccessToken } from "@/database/auth";
import { validateDto } from "@/database/validation";
import { CreateSubmissionDto } from "@/database/dto/create-submission.dto";

export const GET = async (request: Request) => {
  try {
    const db = await getDb();
    const submissionRepository = db.getRepository(Submission);
    const submissions = await submissionRepository.find({
      relations: ["student", "assignment"],
      order: { submittedAt: "DESC" }
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map(s => ({
        id: s.id,
        fileUrl: s.fileUrl,
        studentName: s.student?.name || "Unknown",
        assignmentTitle: s.assignment?.title || "Unknown",
        submittedAt: s.submittedAt
      }))
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error"
    }, { status: 500 });
  }
};

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

    const db = await getDb();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.id } });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json({ success: false, message: "Only students can submit assignments" }, { status: 403 });
    }

    const body = await request.json();
    const { data, errors } = await validateDto(CreateSubmissionDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const assignmentRepository = db.getRepository(Assignment);
    const assignment = await assignmentRepository.findOne({ where: { id: data.assignmentId } });

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    const submissionRepository = db.getRepository(Submission);

    // Check if student already submitted for this assignment
    const existingSubmission = await submissionRepository.findOne({
      where: {
        student: { id: user.id },
        assignment: { id: assignment.id }
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ success: false, message: "You have already submitted for this assignment" }, { status: 400 });
    }

    const submission = submissionRepository.create({
      fileUrl: data.fileUrl,
      text: data.text,
      student: user,
      assignment: assignment,
    });

    await submissionRepository.save(submission);

    return NextResponse.json({
      success: true,
      message: "Submission successful",
      submission: {
        id: submission.id,
        fileUrl: submission.fileUrl,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};