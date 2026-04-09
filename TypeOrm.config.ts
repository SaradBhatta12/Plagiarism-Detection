import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./database/entities/User";
import { Assignment } from "./database/entities/Assignment";
import { Submission } from "./database/entities/Submission";
import { PlagiarismResult } from "./database/entities/PlagiarismResult";

config(); // Load environment variables from .env

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "plagiarism_detector",
  synchronize: false,
  logging: true,
  entities: [User, Assignment, Submission, PlagiarismResult],
  migrations: [],
  subscribers: [],
});

