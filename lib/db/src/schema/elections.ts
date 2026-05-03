import { pgTable, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const electionsTable = pgTable("elections", {
  id: text("id").primaryKey(),
  countryId: text("country_id").notNull(),
  countryName: text("country_name").notNull(),
  countryFlag: text("country_flag").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("upcoming"),
  description: text("description").notNull(),
  results: text("results"),
  candidates: text("candidates").notNull().default("[]"),
  turnout: real("turnout"),
  totalSeats: integer("total_seats"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertElectionSchema = createInsertSchema(electionsTable).omit({ createdAt: true });
export type InsertElection = z.infer<typeof insertElectionSchema>;
export type Election = typeof electionsTable.$inferSelect;
