import { Router } from "express";
import { db } from "@workspace/db";
import { electionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/elections", async (req, res) => {
  try {
    const { countryId, status, limit } = req.query as { countryId?: string; status?: string; limit?: string };
    let rows = await db.select().from(electionsTable).orderBy(electionsTable.date);

    if (countryId) rows = rows.filter(e => e.countryId === countryId);
    if (status) rows = rows.filter(e => e.status === status);

    const limitNum = parseInt(limit || "20");
    rows = rows.slice(0, limitNum);

    res.json(rows.map(e => ({
      id: e.id,
      countryId: e.countryId,
      countryName: e.countryName,
      countryFlag: e.countryFlag,
      title: e.title,
      type: e.type,
      date: e.date,
      status: e.status,
      description: e.description,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/elections/upcoming-summary", async (req, res) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const all = await db.select().from(electionsTable).where(eq(electionsTable.status, "upcoming"));

    const next7 = all.filter(e => new Date(e.date) <= in7Days).length;
    const next30 = all.filter(e => new Date(e.date) <= in30Days).length;
    const featured = all.slice(0, 4).map(e => ({
      id: e.id, countryId: e.countryId, countryName: e.countryName,
      countryFlag: e.countryFlag, title: e.title, type: e.type,
      date: e.date, status: e.status, description: e.description,
    }));

    res.json({ total: all.length, nextSevenDays: next7, nextThirtyDays: next30, featured });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/elections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [election] = await db.select().from(electionsTable).where(eq(electionsTable.id, id)).limit(1);
    if (!election) return res.status(404).json({ error: "Election not found" });

    res.json({
      ...election,
      results: election.results ? JSON.parse(election.results) : null,
      candidates: JSON.parse(election.candidates),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
