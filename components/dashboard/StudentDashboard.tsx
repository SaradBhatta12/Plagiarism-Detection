import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, Clock, Loader2, Send, Eye } from "lucide-react";
import Link from "next/link";
import { useCreateSubmissionMutation, useGetAssignmentsQuery } from "@/app/store/api/apiSlice";

export function StudentDashboard() {
  const { data, isLoading, refetch } = useGetAssignmentsQuery({});
  const [createSubmission, { isLoading: isSubmitting }] = useCreateSubmissionMutation();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [text, setText] = useState("");
  console.log(text)
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const extractTextFromPdf = async (file: File) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const [uploadRes, extractedText] = await Promise.all([
        fetch("/api/upload", { method: "POST", body: formData }).then((r) => r.json()),
        extractTextFromPdf(file),
      ]);

      if (uploadRes.error) throw new Error(uploadRes.error);
      setFileUrl(uploadRes.url);
      setText(extractedText);
      toast({
        title: "File Processed",
        description: "PDF uploaded and text extracted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "File processing failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubmission({
        assignmentId: selectedAssignment.id,
        fileUrl,
        text
      }).unwrap();
      refetch();
      setOpen(false);
      setFileUrl("");
      setText("");
      toast({
        title: "Submission Successful",
        description: "Your work has been submitted for review.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err?.data?.message || "An error occurred during submission",
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
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const assignments = data?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="">Browse your assignments and submit your work for plagiarism checking.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Assignment</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment: any) => {
              const hasSubmitted = !!assignment.ownSubmissionId;
              return (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{assignment.title}</span>
                      <span className="text-xs line-clamp-1">{assignment.description}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!hasSubmitted ? (
                      <Dialog open={open && selectedAssignment?.id === assignment.id} onOpenChange={(val) => {
                        setOpen(val);
                        if (val) setSelectedAssignment(assignment);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Work: {assignment.title}</DialogTitle>
                            <DialogDescription>
                              Upload your PDF. We'll automatically extract the text for plagiarism checking.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Upload PDF</Label>
                                <Input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={handleFileChange}
                                  disabled={isUploading}
                                  required={!fileUrl}
                                />
                                {isUploading && (
                                  <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                                  </p>
                                )}
                                {fileUrl && !isUploading && (
                                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Ready to submit
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Extracted Text</Label>
                                <Textarea
                                  value={text}
                                  onChange={(e) => setText(e.target.value)}
                                  placeholder="Extracted text will appear here..."
                                  className="min-h-[150px]"
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                              <Button type="submit" disabled={isSubmitting || !fileUrl || !text}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Submission
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Link href={`/plagiarism/${assignment.ownSubmissionId}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-600 hover:text-slate-900">
                          <Eye className="h-4 w-4" />
                          View Report
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 opacity-20" />
                    <p>No assignments found.</p>
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
