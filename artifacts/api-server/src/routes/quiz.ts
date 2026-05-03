import { Router } from "express";
import { db } from "@workspace/db";
import { quizQuestionsTable, userProgressTable, achievementsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const LEVEL_THRESHOLDS = {
  beginner: 0,
  "civic-learner": 100,
  analyst: 300,
  "policy-expert": 700,
  "democracy-champion": 1500,
};

function getLevelForXp(xp: number): string {
  if (xp >= 1500) return "democracy-champion";
  if (xp >= 700) return "policy-expert";
  if (xp >= 300) return "analyst";
  if (xp >= 100) return "civic-learner";
  return "beginner";
}

function getXpToNextLevel(level: string, xp: number): number {
  const thresholds: Record<string, number> = {
    beginner: 100,
    "civic-learner": 300,
    analyst: 700,
    "policy-expert": 1500,
    "democracy-champion": 9999,
  };
  return (thresholds[level] || 100) - xp;
}

router.get("/quiz/questions", async (req, res) => {
  try {
    const { category, difficulty, limit = "10" } = req.query as {
      category?: string; difficulty?: string; limit?: string;
    };

    let rows = await db.select().from(quizQuestionsTable);
    if (category) rows = rows.filter(q => q.category === category);
    if (difficulty) rows = rows.filter(q => q.difficulty === difficulty);

    // Shuffle and limit
    const shuffled = rows.sort(() => Math.random() - 0.5).slice(0, parseInt(limit));

    res.json(shuffled.map(q => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options),
      category: q.category,
      difficulty: q.difficulty,
      xpReward: q.xpReward,
      explanation: q.explanation,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quiz/submit", async (req, res) => {
  try {
    const { questionId, selectedOption, sessionId, timeTakenSeconds = 30 } = req.body;

    const [question] = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, questionId))
      .limit(1);

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const correct = selectedOption === question.correctOption;
    const baseXp = correct ? question.xpReward : 0;
    const speedBonus = correct && timeTakenSeconds < 10 ? 5 : 0;
    const xpEarned = baseXp + speedBonus;

    // Get or create user progress
    const [existing] = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.sessionId, sessionId))
      .limit(1);

    const prevXp = existing?.xp || 0;
    const prevStreak = existing?.streak || 0;
    const newStreak = correct ? prevStreak + 1 : 0;
    const streakBonus = correct && newStreak > 0 && newStreak % 3 === 0 ? 10 : 0;
    const totalXp = prevXp + xpEarned + streakBonus;

    const prevLevel = existing?.level || "beginner";
    const newLevel = getLevelForXp(totalXp);

    if (existing) {
      await db
        .update(userProgressTable)
        .set({
          xp: totalXp,
          questionsAnswered: (existing.questionsAnswered || 0) + 1,
          correctAnswers: (existing.correctAnswers || 0) + (correct ? 1 : 0),
          streak: newStreak,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(userProgressTable.sessionId, sessionId));
    } else {
      await db.insert(userProgressTable).values({
        sessionId,
        xp: totalXp,
        questionsAnswered: 1,
        correctAnswers: correct ? 1 : 0,
        streak: newStreak,
        level: newLevel,
      });
    }

    // Award achievements
    if (newStreak === 5) {
      await db.insert(achievementsTable).values({
        id: randomUUID(),
        sessionId,
        name: "Hot Streak!",
        description: "Answer 5 questions correctly in a row",
        icon: "🔥",
        category: "streak",
      }).onConflictDoNothing();
    }

    res.json({
      correct,
      correctOption: question.correctOption,
      explanation: question.explanation,
      xpEarned: xpEarned + streakBonus,
      streakBonus,
      newLevel: newLevel !== prevLevel ? newLevel : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/quiz/leaderboard", async (req, res) => {
  try {
    const { period = "weekly", limit = "10" } = req.query as { period?: string; limit?: string };

    const rows = await db
      .select()
      .from(userProgressTable)
      .orderBy(sql`${userProgressTable.xp} DESC`)
      .limit(parseInt(limit));

    res.json(rows.map((row, index) => ({
      rank: index + 1,
      sessionId: row.sessionId,
      displayName: row.displayName,
      level: row.level,
      xp: row.xp,
      questionsAnswered: row.questionsAnswered,
      accuracy: row.questionsAnswered > 0
        ? parseFloat(((row.correctAnswers / row.questionsAnswered) * 100).toFixed(1))
        : 0,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
