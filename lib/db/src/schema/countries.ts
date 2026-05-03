import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const countriesTable = pgTable("countries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  flag: text("flag").notNull(),
  region: text("region").notNull(),
  electoralSystem: text("electoral_system").notNull(),
  nextElectionDate: text("next_election_date"),
  voterTurnout: real("voter_turnout"),
  registeredVoters: integer("registered_voters"),
  votingAge: integer("voting_age").notNull().default(18),
  registrationDeadlineDays: integer("registration_deadline_days").notNull().default(30),
  overview: text("overview").notNull().default(""),
  idRequirements: text("id_requirements").notNull().default("[]"),
  votingProcess: text("voting_process").notNull().default("[]"),
  keyFacts: text("key_facts").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countriesTable).omit({ createdAt: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countriesTable.$inferSelect;
