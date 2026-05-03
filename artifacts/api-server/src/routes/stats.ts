import { Router } from "express";
import { db } from "@workspace/db";
import {
  countriesTable, electionsTable, quizQuestionsTable, claimsTable,
  electoralSystemsTable, userProgressTable, newsTable
} from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (req, res) => {
  try {
    const [countryCount] = await db.select({ count: count() }).from(countriesTable);
    const [electionCount] = await db.select({ count: count() }).from(electionsTable).where(eq(electionsTable.status, "upcoming"));
    const [quizCount] = await db.select({ count: count() }).from(quizQuestionsTable);
    const [claimCount] = await db.select({ count: count() }).from(claimsTable);
    const [systemCount] = await db.select({ count: count() }).from(electoralSystemsTable);
    const [userCount] = await db.select({ count: count() }).from(userProgressTable);

    const featuredElections = await db
      .select()
      .from(electionsTable)
      .where(eq(electionsTable.status, "upcoming"))
      .orderBy(electionsTable.date)
      .limit(4);

    const recentClaims = await db
      .select()
      .from(claimsTable)
      .orderBy(desc(claimsTable.verifiedAt))
      .limit(3);

    res.json({
      totalCountries: Number(countryCount.count),
      upcomingElections: Number(electionCount.count),
      questionsInDatabase: Number(quizCount.count),
      claimsVerified: Number(claimCount.count),
      electoralSystemsCovered: Number(systemCount.count),
      activeUsers: Number(userCount.count),
      featuredElections: featuredElections.map(e => ({
        id: e.id, countryId: e.countryId, countryName: e.countryName,
        countryFlag: e.countryFlag, title: e.title, type: e.type,
        date: e.date, status: e.status, description: e.description,
      })),
      recentClaims: recentClaims.map(c => ({
        id: c.id, claim: c.claim, verdict: c.verdict, confidence: c.confidence,
        explanation: c.explanation, sources: JSON.parse(c.sources),
        manipulationFlags: JSON.parse(c.manipulationFlags),
        verifiedAt: c.verifiedAt?.toISOString() || new Date().toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
