import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const electoralSystemsTable = pgTable("electoral_systems", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  description: text("description").notNull(),
  countriesUsing: integer("countries_using").notNull().default(0),
  fairnessScore: integer("fairness_score").notNull().default(50),
  simplicityScore: integer("simplicity_score").notNull().default(50),
  proportionalityScore: integer("proportionality_score").notNull().default(50),
  examples: text("examples").notNull().default("[]"),
  howItWorks: text("how_it_works").notNull().default("[]"),
  pros: text("pros").notNull().default("[]"),
  cons: text("cons").notNull().default("[]"),
  historyAndOrigin: text("history_and_origin").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertElectoralSystemSchema = createInsertSchema(electoralSystemsTable).omit({ createdAt: true });
export type InsertElectoralSystem = z.infer<typeof insertElectoralSystemSchema>;
export type ElectoralSystem = typeof electoralSystemsTable.$inferSelect;
