import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775632044407 implements MigrationInterface {
    name = 'InitialSchema1775632044407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plagiarism_result" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "similarityScore" double precision NOT NULL, "matchingPassages" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "assignmentId" uuid, "submissionAId" uuid, "submissionBId" uuid, CONSTRAINT "PK_255b56d439715658fe0049a4e6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileUrl" character varying NOT NULL, "text" text NOT NULL, "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), "assignmentId" uuid, "studentId" uuid, CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assignment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dueDate" TIMESTAMP, "teacherId" uuid, CONSTRAINT "PK_43c2f5a3859f54cedafb270f37e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'student', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" ADD CONSTRAINT "FK_6f54bc9eaf51de32074c8c0f6f8" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" ADD CONSTRAINT "FK_0f9ae4a49877cd50e1b867eb57b" FOREIGN KEY ("submissionAId") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" ADD CONSTRAINT "FK_b6ebf3047f061367f3954b915d8" FOREIGN KEY ("submissionBId") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submission" ADD CONSTRAINT "FK_ef99745f278ca701c5efe5d8ddd" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submission" ADD CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD CONSTRAINT "FK_12fec8981c30ecef4932627c260" FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assignment" DROP CONSTRAINT "FK_12fec8981c30ecef4932627c260"`);
        await queryRunner.query(`ALTER TABLE "submission" DROP CONSTRAINT "FK_a174d175dc504dce8df5c217014"`);
        await queryRunner.query(`ALTER TABLE "submission" DROP CONSTRAINT "FK_ef99745f278ca701c5efe5d8ddd"`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" DROP CONSTRAINT "FK_b6ebf3047f061367f3954b915d8"`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" DROP CONSTRAINT "FK_0f9ae4a49877cd50e1b867eb57b"`);
        await queryRunner.query(`ALTER TABLE "plagiarism_result" DROP CONSTRAINT "FK_6f54bc9eaf51de32074c8c0f6f8"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "assignment"`);
        await queryRunner.query(`DROP TABLE "submission"`);
        await queryRunner.query(`DROP TABLE "plagiarism_result"`);
    }

}
