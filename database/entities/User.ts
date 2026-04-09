import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Assignment } from "./Assignment";
import type { Submission } from "./Submission";


export enum UserRole {
  TEACHER = "teacher",
  STUDENT = "student",
}

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  // Relations
  @OneToMany("assignment", (assignment: any) => assignment.teacher)
  assignments!: Assignment[];

  @OneToMany("submission", (submission: any) => submission.student)
  submissions!: Submission[];
}
