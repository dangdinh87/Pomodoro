CREATE INDEX "feedbacks_user_id_idx" ON "feedbacks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "focus_sessions_user_mode_created_idx" ON "focus_sessions" USING btree ("user_id","mode","created_at");--> statement-breakpoint
CREATE INDEX "focus_sessions_task_id_idx" ON "focus_sessions" USING btree ("task_id");--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_type_check" CHECK ("feedbacks"."type" in ('feature', 'bug', 'question', 'other'));--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_mode_check" CHECK ("focus_sessions"."mode" in ('work', 'shortBreak', 'longBreak'));--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priority_check" CHECK ("tasks"."priority" in ('LOW', 'MEDIUM', 'HIGH'));--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_check" CHECK ("tasks"."status" in ('TODO', 'DOING', 'DONE'));