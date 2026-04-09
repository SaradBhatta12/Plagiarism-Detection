"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetAssignmentByIdQuery } from "@/app/store/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { ArrowLeft, BookOpen, Clock, Users, FileText, ExternalLink, ShieldCheck, Send } from "lucide-react";
import Link from "next/link";

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetAssignmentByIdQuery(id);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    refetch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Assignment not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const assignment = data.data;
  const isTeacher = user?.role === "teacher";

  // Filter submissions based on role
  const allSubmissions = assignment.submissions || [];
  const submissions = isTeacher
    ? allSubmissions
    : allSubmissions.filter((s: any) => s.student.id === user?.id);

  const hasSubmitted = submissions.length > 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Assignment Detail
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Created {new Date(assignment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">
                {assignment.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {isTeacher ? "Student Submissions" : "Your Submission"}
              </h2>
              {isTeacher && <Badge variant="secondary">{submissions.length} Total</Badge>}
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isTeacher ? "Student" : "Status"}</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        {isTeacher ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{sub.student.name}</span>
                            <span className="text-xs">{sub.student.email}</span>
                          </div>
                        ) : (
                          <Badge variant="success">Submitted</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/plagiarism/${sub.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <ShieldCheck className="h-4 w-4" />
                            Report
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        {isTeacher ? "No submissions yet." : "You haven't submitted anything yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="">Teacher</span>
                <span className="font-medium">{assignment.teacher.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="">Due Date</span>
                <span className="font-medium text-red-600">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                </span>
              </div>
              {isTeacher && (
                <div className="flex justify-between items-center text-sm">
                  <span className="">Total Submissions</span>
                  <span className="font-medium">{submissions.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {!hasSubmitted && (
            <Card className="bg-slate-900 text-slate-50 font-medium">
              <CardHeader>
                <CardTitle className="text-lg">Ready to Submit?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-400 mb-4">You can submit your PDF directly from the dashboard.</p>
                <Button onClick={() => router.push("/")} className="w-full bg-slate-50 text-slate-900 hover:bg-slate-200">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
