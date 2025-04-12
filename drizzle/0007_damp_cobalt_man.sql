ALTER TABLE "micro-tales-app_account" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "micro-tales-app_session" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "micro-tales-app_user" ADD COLUMN "image" varchar(255);