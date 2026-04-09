import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import type { User } from "./User";
import type { Submission } from "./Submission";

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne("User", (user: any) => user.assignments)
  teacher!: User;

  @OneToMany("Submission", (submission: any) => submission.assignment)
  submissions!: Submission[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  dueDate!: Date;
}
