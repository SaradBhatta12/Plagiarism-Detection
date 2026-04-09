"use client";

import React, { useEffect, useState } from "react";
import { useGetAssignmentsQuery, useCreateAssignmentMutation } from "@/app/store/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Plus, BookOpen, Clock, Users, Loader2, MoreVertical, Eye } from "lucide-react";

export function TeacherDashboard() {
  const { data, isLoading, refetch } = useGetAssignmentsQuery({});
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment({ title, description }).unwrap();
      setOpen(false);
      setTitle("");
      setDescription("");
      toast({
        title: "Assignment Created",
        description: "Your new assignment has been successfully published.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to create assignment",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    refetch();
  }, []);


  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin " />
      </div>
    );
  }

  const assignments = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">Teacher Dashboard</h1>
          <p className="">Manage your assignments and monitor student submissions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-slate-50 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
              <DialogDescription>
                Add a new assignment for your students to submit their work.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. Introduction to AI"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the assignment requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm  overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Assignment Details</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment: any) => (
              <TableRow key={assignment.id} className="group">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold  leading-none">
                      {assignment.title}
                    </span>
                    <span className="text-xs  line-clamp-1 max-w-[250px]">
                      {assignment.description || "No description provided."}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1 font-medium bg-secondary/50">
                    <Users className="h-3 w-3 " />
                    {assignment.submissionsCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs ">
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/assignments/${assignment.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-slate-100">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 ">
                    <BookOpen className="h-8 w-8 opacity-20" />
                    <p>No assignments found. Create one to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
