import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { Assignment } from "@/database/entities/Assignment";
import { User, UserRole } from "@/database/entities/User";
import { validateDto } from "@/database/validation";
import { UpdateAssignmentDto } from "@/database/dto/update-assignment.dto";
import { accessRoles } from "@/database/auth";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const db = await getDb();
    const assignmentRepository = db.getRepository(Assignment);

    const assignment = await assignmentRepository.findOne({
      where: { id },
      relations: ["teacher", "submissions", "submissions.student"],
    });

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        teacher: { id: assignment.teacher.id, name: assignment.teacher.name },
        submissions: (assignment.submissions || []).map(s => ({
          id: s.id,
          fileUrl: s.fileUrl,
          text: s.text,
          submittedAt: s.submittedAt,
          student: { id: s.student.id, name: s.student.name, email: s.student.email }
        }))
      },
    });
  } catch (error) {
    console.error("Fetch Assignment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const { user, error } = accessRoles(request, [UserRole.TEACHER]);
    if (error) return error;

    const body = await request.json();
    const { data, errors } = await validateDto(UpdateAssignmentDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = await getDb();
    const assignmentRepository = db.getRepository(Assignment);

    const assignment = await assignmentRepository.findOne({
      where: { id },
      relations: ["teacher"],
    });

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    // Ensure only the teacher who created the assignment can update it
    if (assignment.teacher.id !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You don't have permission to update this assignment" },
        { status: 403 }
      );
    }

    if (data.title) assignment.title = data.title;
    if (data.description) assignment.description = data.description;
    if (data.dueDate) assignment.dueDate = new Date(data.dueDate);

    await assignmentRepository.save(assignment);

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      data: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
      },
    });
  } catch (error) {
    console.error("Update Assignment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const { user, error } = accessRoles(request, [UserRole.TEACHER]);
    if (error) return error;

    const db = await getDb();
    const assignmentRepository = db.getRepository(Assignment);

    const assignment = await assignmentRepository.findOne({
      where: { id },
      relations: ["teacher"],
    });

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    // Ensure only the teacher who created the assignment can delete it
    if (assignment.teacher.id !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You don't have permission to delete this assignment" },
        { status: 403 }
      );
    }

    await assignmentRepository.remove(assignment);

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
