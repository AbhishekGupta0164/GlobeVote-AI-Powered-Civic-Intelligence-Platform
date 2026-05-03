import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable, achievementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function getXpToNextLevel(level: string, xp: number): number {
  const thresholds: Record<string, number> = {
    beginner: 100,
    "civic-learner": 300,
    analyst: 700,
    "policy-expert": 1500,
    "democracy-champion": 9999,
  };
  return Math.max(0, (thresholds[level] || 100) - xp);
}

router.get("/progress/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    let [progress] = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.sessionId, sessionId))
      .limit(1);

    if (!progress) {
      // Create default progress
      await db.insert(userProgressTable).values({ sessionId });
      [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.sessionId, sessionId)).limit(1);
    }

    const accuracy = progress.questionsAnswered > 0
      ? parseFloat(((progress.correctAnswers / progress.questionsAnswered) * 100).toFixed(1))
      : 0;

    res.json({
      sessionId: progress.sessionId,
      displayName: progress.displayName,
      level: progress.level,
      xp: progress.xp,
      xpToNextLevel: getXpToNextLevel(progress.level, progress.xp),
      questionsAnswered: progress.questionsAnswered,
      correctAnswers: progress.correctAnswers,
      accuracy,
      streak: progress.streak,
      countriesExplored: progress.countriesExplored,
      claimsVerified: progress.claimsVerified,
      chatInteractions: progress.chatInteractions,
      joinedAt: progress.joinedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/progress/:sessionId/achievements", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const achievements = await db
      .select()
      .from(achievementsTable)
      .where(eq(achievementsTable.sessionId, sessionId))
      .orderBy(desc(achievementsTable.unlockedAt));

    res.json(achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      unlockedAt: a.unlockedAt?.toISOString() || new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
