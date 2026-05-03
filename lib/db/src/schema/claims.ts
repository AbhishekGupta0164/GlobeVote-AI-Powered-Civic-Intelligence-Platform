import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimsTable = pgTable("claims", {
  id: text("id").primaryKey(),
  claim: text("claim").notNull(),
  verdict: text("verdict").notNull(),
  confidence: real("confidence").notNull(),
  explanation: text("explanation").notNull(),
  sources: text("sources").notNull().default("[]"),
  manipulationFlags: text("manipulation_flags").notNull().default("[]"),
  countryId: text("country_id"),
  verifiedAt: timestamp("verified_at").defaultNow(),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ verifiedAt: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
