import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { Submission } from "@/database/entities/Submission";

export const dynamic = "force-dynamic";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const p = await params;
    const { id } = p;
    console.log(`[API] Requested URL: ${request.url}`);
    console.log(`[API] Derived ID from params: ${id}`);
    const db = await getDb();
    const submissionRepository = db.getRepository(Submission);

    const submission = await submissionRepository.findOne({
      where: { id },
      relations: [
        "student",
        "assignment",
        "plagiarismResultsA",
        "plagiarismResultsB",
        "plagiarismResultsA.submissionB",
        "plagiarismResultsB.submissionA",
        "plagiarismResultsA.submissionB.student",
        "plagiarismResultsB.submissionA.student"
      ],
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Combine results where this submission is either A or B
    const plagiarismResults = [
      ...submission.plagiarismResultsA.map(r => ({
        id: r.id,
        otherStudentName: r.submissionB?.student?.name || "Unknown",
        similarityScore: r.similarityScore,
        matchingPassages: r.matchingPassages,
        comparedAt: r.createdAt
      })),
      ...submission.plagiarismResultsB.map(r => ({
        id: r.id,
        otherStudentName: r.submissionA?.student?.name || "Unknown",
        similarityScore: r.similarityScore,
        matchingPassages: r.matchingPassages,
        comparedAt: r.createdAt
      }))
    ].sort((a, b) => b.similarityScore - a.similarityScore);

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        fileUrl: submission.fileUrl,
        text: submission.text,
        submittedAt: submission.submittedAt,
        student: { id: submission.student.id, name: submission.student.name },
        assignment: { id: submission.assignment.id, title: submission.assignment.title },
        plagiarismResults
      },
    });
  } catch (error) {
    console.error("Fetch Submission ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
