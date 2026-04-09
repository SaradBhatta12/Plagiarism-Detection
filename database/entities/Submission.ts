import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import type { User } from "./User";
import type { Assignment } from "./Assignment";
import type { PlagiarismResult } from "./PlagiarismResult";

@Entity("submission")
export class Submission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("assignment", (assignment: any) => assignment.submissions)
  assignment!: Assignment;

  @ManyToOne("user", (user: any) => user.submissions)
  student!: User;

  @Column()
  fileUrl!: string; // Where PDF is stored

  @Column("text")
  text!: string; // Extracted text

  @CreateDateColumn()
  submittedAt!: Date;

  @OneToMany("plagiarism_result", (result: any) => result.submissionA)
  plagiarismResultsA!: PlagiarismResult[];

  @OneToMany("plagiarism_result", (result: any) => result.submissionB)
  plagiarismResultsB!: PlagiarismResult[];
}
