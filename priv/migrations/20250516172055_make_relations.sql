ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "otps" DROP CONSTRAINT "otps_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "security_preferences" DROP CONSTRAINT "security_preferences_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_preferences" ADD CONSTRAINT "security_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;