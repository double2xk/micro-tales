CREATE TABLE "micro-tales-app_account" (
	"user_id" uuid,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "micro-tales-app_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_edit_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"story_id" uuid,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_story" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"genre" text NOT NULL,
	"rating" integer DEFAULT 0,
	"reading_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"edited_at" timestamp DEFAULT now(),
	"is_public" boolean DEFAULT true,
	"is_guest" boolean DEFAULT false,
	"secret_code" text,
	"author_id" uuid
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_story_read" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"story_id" uuid,
	"read_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"passwordHash" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "micro-tales-app_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "micro-tales-app_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "micro-tales-app_account" ADD CONSTRAINT "micro-tales-app_account_user_id_micro-tales-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."micro-tales-app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_edit_access_tokens" ADD CONSTRAINT "micro-tales-app_edit_access_tokens_story_id_micro-tales-app_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."micro-tales-app_story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_ratings" ADD CONSTRAINT "micro-tales-app_ratings_user_id_micro-tales-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."micro-tales-app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_ratings" ADD CONSTRAINT "micro-tales-app_ratings_story_id_micro-tales-app_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."micro-tales-app_story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_session" ADD CONSTRAINT "micro-tales-app_session_user_id_micro-tales-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."micro-tales-app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_story" ADD CONSTRAINT "micro-tales-app_story_author_id_micro-tales-app_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."micro-tales-app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_story_read" ADD CONSTRAINT "micro-tales-app_story_read_user_id_micro-tales-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."micro-tales-app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro-tales-app_story_read" ADD CONSTRAINT "micro-tales-app_story_read_story_id_micro-tales-app_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."micro-tales-app_story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "micro-tales-app_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "micro-tales-app_session" USING btree ("user_id");