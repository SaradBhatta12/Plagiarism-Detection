import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import type { Assignment } from "./Assignment";
import type { Submission } from "./Submission";

@Entity("plagiarism_result")
export class PlagiarismResult {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("assignment")
  assignment!: Assignment;

  @ManyToOne("submission", (submission: any) => submission.plagiarismResultsA)
  submissionA!: Submission;

  @ManyToOne("submission", (submission: any) => submission.plagiarismResultsB)
  submissionB!: Submission;

  @Column("float")
  similarityScore!: number; // 0-100

  @Column("jsonb")
  matchingPassages!: {
    textA: string;
    textB: string;
    similarity: number;
  }[]; // Array of passages

  @CreateDateColumn()
  createdAt!: Date;
}
