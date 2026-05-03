import { Router } from "express";
import { db } from "@workspace/db";
import { countriesTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";

const router = Router();

router.get("/countries", async (req, res) => {
  try {
    const { search, region } = req.query as { search?: string; region?: string };
    let rows = await db.select().from(countriesTable);

    if (search) {
      rows = rows.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (region) {
      rows = rows.filter(c => c.region === region);
    }

    res.json(rows.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      flag: c.flag,
      region: c.region,
      electoralSystem: c.electoralSystem,
      nextElectionDate: c.nextElectionDate,
      voterTurnout: c.voterTurnout,
      registeredVoters: c.registeredVoters,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, id)).limit(1);
    if (!country) {
      res.status(404).json({ error: "Country not found" });
      return;
    }

    res.json({
      ...country,
      idRequirements: JSON.parse(country.idRequirements),
      votingProcess: JSON.parse(country.votingProcess),
      keyFacts: JSON.parse(country.keyFacts),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
