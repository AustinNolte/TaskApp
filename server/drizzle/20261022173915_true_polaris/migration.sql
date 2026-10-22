ALTER TABLE "tasks" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "due_date" timestamp NOT NULL;