"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetSubmissionByIdQuery, useRunPlagiarismScanMutation } from "@/app/store/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle, CheckCircle2, Loader2, Sparkles, User, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlagiarismReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useGetSubmissionByIdQuery(id);
  console.log(data)
  const [runScan, { isLoading: isScanning }] = useRunPlagiarismScanMutation();


  useEffect(() => {
    refetch()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const submission = data?.data;

  if (!submission) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Submission not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleRunScan = async () => {
    try {
      await runScan(id).unwrap();
      toast({
        title: "Scan Completed",
        description: "The plagiarism analysis has been updated.",
      });
      refetch()
    } catch (err: any) {
      toast({
        title: "Scan Failed",
        description: err?.data?.message || "Could not connect to the local LLM model.",
        variant: "destructive",
      });
    }
  };

  const results = submission.plagiarismResults || [];
  const maxSimilarity = results.length > 0 ? results[0].similarityScore : 0;

  const getStatusColor = (score: number) => {
    if (score < 15) return "text-emerald-600";
    if (score < 40) return "text-amber-500";
    return "text-red-600";
  };

  const getStatusBg = (score: number) => {
    if (score < 15) return "border-emerald-100 bg-emerald-50/30";
    if (score < 40) return "border-amber-100 bg-amber-50/30";
    return "border-red-100 bg-red-50/30";
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plagiarism Report</h1>
            <p className="text-sm">{submission.assignment.title} • {submission.student.name}</p>
          </div>
        </div>
        <Button
          onClick={handleRunScan}
          disabled={isScanning}
          className="bg-slate-900 text-slate-50 hover:bg-slate-800 gap-2"
        >
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isScanning ? "Analyzing..." : (results.length > 0 ? "Re-scan Content" : "Run Plagiarism Scan")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className={getStatusBg(maxSimilarity)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Global Similarity Index</CardTitle>
              <ShieldCheck className={`h-5 w-5 ${getStatusColor(maxSimilarity)}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getStatusColor(maxSimilarity)}`}>
                {maxSimilarity.toFixed(1)}% Similarity
              </div>
              <p className="text-xs mt-1">
                {results.length === 0
                  ? "No results yet. Run a scan to analyze this submission."
                  : maxSimilarity < 15
                    ? "This document is highly original."
                    : maxSimilarity < 40
                      ? "Moderate similarity detected with other submissions."
                      : "Critical similarity detected. Manual review recommended."
                }
              </p>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Matches with Other Students</h2>
              <div className="grid gap-4">
                {results.map((result: any) => (
                  <Card key={result.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-semibold">{result.otherStudentName}</p>
                            <p className="text-xs text-slate-500">Submitted in this assignment</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getStatusColor(result.similarityScore)}`}>
                            {result.similarityScore}%
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Similarity</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {result.matchingPassages?.slice(0, 2).map((passage: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border text-xs">
                            <p className="font-bold mb-1 italic">Matching phrase:</p>
                            <p className="line-clamp-2">"{passage.textA}"</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Raw Submission Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50 border text-sm font-mono whitespace-pre-wrap min-h-[400px]">
                {submission.text || "No text content available."}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Engine</span>
                  <Badge variant="outline" className="font-mono">llama3 (local)</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Scan Status</span>
                  <Badge variant={results.length > 0 ? "success" : "secondary"}>
                    {results.length > 0 ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Compared Against</span>
                  <span className="font-medium">{results.length} Students</span>
                </div>
              </div>

              <hr />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Analysis Checklist</h3>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${maxSimilarity < 15 ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Original structure</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${results.length > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Cross-student check</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Reference verification</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
