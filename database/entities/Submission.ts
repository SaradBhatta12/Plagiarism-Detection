import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import type { User } from "./User";
import type { Assignment } from "./Assignment";
import type { PlagiarismResult } from "./PlagiarismResult";

@Entity()
export class Submission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("Assignment", (assignment: any) => assignment.submissions)
  assignment!: Assignment;

  @ManyToOne("User", (user: any) => user.submissions)
  student!: User;

  @Column()
  fileUrl!: string; // Where PDF is stored

  @Column("text")
  text!: string; // Extracted text

  @CreateDateColumn()
  submittedAt!: Date;

  @OneToMany("PlagiarismResult", (result: any) => result.submissionA)
  plagiarismResultsA!: PlagiarismResult[];

  @OneToMany("PlagiarismResult", (result: any) => result.submissionB)
  plagiarismResultsB!: PlagiarismResult[];
}
