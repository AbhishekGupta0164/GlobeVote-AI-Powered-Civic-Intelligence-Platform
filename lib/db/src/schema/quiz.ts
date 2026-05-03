import { pgTable, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  options: text("options").notNull(),
  correctOption: integer("correct_option").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  xpReward: integer("xp_reward").notNull().default(10),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgressTable = pgTable("user_progress", {
  sessionId: text("session_id").primaryKey(),
  displayName: text("display_name").notNull().default("Anonymous Voter"),
  level: text("level").notNull().default("beginner"),
  xp: integer("xp").notNull().default(0),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  countriesExplored: integer("countries_explored").notNull().default(0),
  claimsVerified: integer("claims_verified").notNull().default(0),
  chatInteractions: integer("chat_interactions").notNull().default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievementsTable = pgTable("achievements", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ createdAt: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;

export const insertUserProgressSchema = createInsertSchema(userProgressTable).omit({ joinedAt: true, updatedAt: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgressTable.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievementsTable).omit({ unlockedAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievementsTable.$inferSelect;
