CREATE TYPE "public"."user_role" AS ENUM('admin', 'author');--> statement-breakpoint
ALTER TABLE "micro-tales-app_user" ADD COLUMN "role" "user_role" DEFAULT 'author';