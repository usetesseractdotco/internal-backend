CREATE TYPE "public"."organization_invite_roles" AS ENUM('admin', 'billing', 'developer', 'member');--> statement-breakpoint
CREATE TABLE "organization_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "organization_invite_roles" DEFAULT 'member',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "organization_invites_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_organization_id_orgs_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;