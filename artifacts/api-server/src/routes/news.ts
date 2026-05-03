import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/news", async (req, res) => {
  try {
    const { countryId, topic, limit = "20" } = req.query as {
      countryId?: string; topic?: string; limit?: string;
    };

    let rows = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));

    if (countryId) rows = rows.filter(n => n.countryId === countryId);
    if (topic) rows = rows.filter(n => n.topic === topic);

    rows = rows.slice(0, parseInt(limit));

    res.json(rows.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      sourceUrl: n.sourceUrl,
      biasRating: n.biasRating,
      relevanceScore: n.relevanceScore,
      topic: n.topic,
      countryId: n.countryId,
      imageUrl: n.imageUrl,
      publishedAt: n.publishedAt?.toISOString() || new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [article] = await db.select().from(newsTable).where(eq(newsTable.id, id)).limit(1);
    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json({
      ...article,
      publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
