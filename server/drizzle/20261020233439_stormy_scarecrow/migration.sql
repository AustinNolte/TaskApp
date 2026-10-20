CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"hashed_password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
