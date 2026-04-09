import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { Assignment } from "@/database/entities/Assignment";
import { User, UserRole } from "@/database/entities/User";
import { validateDto } from "@/database/validation";
import { CreateAssignmentDto } from "@/database/dto/create-assignment.dto";
import { accessRoles } from "@/database/auth";
import { Submission } from "@/database/entities/Submission";
import { In } from "typeorm";
import { PlagiarismResult } from "@/database/entities/PlagiarismResult";

export const GET = async (request: Request) => {
  try {
    const { user, error } = accessRoles(request, [UserRole.TEACHER, UserRole.STUDENT]);
    if (error) return error;

    const db = await getDb();
    const assignmentRepository = db.getRepository(Assignment);

    if (user.role === UserRole.TEACHER) {


      const assignments = await assignmentRepository.find({
        where: { teacher: { id: user.id } },
        relations: ["teacher"],
        order: { createdAt: "DESC" },
      });
      const submissionsRepository = db.getRepository(Submission);
      const submissions = await submissionsRepository.find({
        relations: ["assignment"],
        where: { assignment: { id: In(assignments.map((a) => a.id)) } },
      });


      const formattedAssignments = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        createdAt: a.createdAt,
        teacher: { id: a.teacher.id, name: a.teacher.name },
        submissionsCount: submissions.filter((s) => s.assignment.id === a.id).length,
      }));

      return NextResponse.json({
        success: true,
        data: formattedAssignments,
      });

    } else if (user.role === UserRole.STUDENT) {
      const assignments = await assignmentRepository.find({
        relations: ["teacher"],
        order: { createdAt: "DESC" },
      });
      const submissionsRepository = db.getRepository(Submission);
      const allSubmissions = await submissionsRepository.find({
        relations: ["assignment", "student"],
        where: { assignment: { id: In(assignments.map((a) => a.id)) } },
      });

      const formattedAssignments = assignments.map((a) => {
        const studentSubmission = allSubmissions.find(
          (s) => s.assignment.id === a.id && s.student.id === user.id
        );
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate,
          createdAt: a.createdAt,
          teacher: { id: a.teacher.id, name: a.teacher.name },
          submissionsCount: allSubmissions.filter((s) => s.assignment.id === a.id).length,
          ownSubmissionId: studentSubmission ? studentSubmission.id : null,
        };
      });

      return NextResponse.json({
        success: true,
        data: formattedAssignments,
      });
    }
  } catch (error) {
    console.error("Fetch Assignments Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const { user, error } = accessRoles(request, [UserRole.TEACHER]);
    console.log(user)
    if (error) return error;

    const body = await request.json();
    const { data, errors } = await validateDto(CreateAssignmentDto, body);

    if (errors) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = await getDb();
    const assignmentRepository = db.getRepository(Assignment);
    const userRepository = db.getRepository(User);

    const teacher = await userRepository.findOne({ where: { id: user.id } });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const existingAssignment = await assignmentRepository.findOne({ where: { title: data.title } });
    if (existingAssignment) {
      return NextResponse.json({ success: false, message: "Assignment already exists" }, { status: 400 });
    }

    const assignment = assignmentRepository.create({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      teacher: teacher,
    });

    await assignmentRepository.save(assignment);

    return NextResponse.json(
      {
        success: true,
        message: "Assignment created successfully",
        data: {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          createdAt: assignment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Assignment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};