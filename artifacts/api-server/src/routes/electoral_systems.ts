import { Router } from "express";
import { db } from "@workspace/db";
import { electoralSystemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/electoral-systems", async (req, res) => {
  try {
    const rows = await db.select().from(electoralSystemsTable);
    res.json(rows.map(s => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      description: s.description,
      countriesUsing: s.countriesUsing,
      fairnessScore: s.fairnessScore,
      simplicityScore: s.simplicityScore,
      proportionalityScore: s.proportionalityScore,
      examples: JSON.parse(s.examples),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/electoral-systems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [system] = await db.select().from(electoralSystemsTable).where(eq(electoralSystemsTable.id, id)).limit(1);
    if (!system) {
      res.status(404).json({ error: "Electoral system not found" });
      return;
    }

    res.json({
      ...system,
      examples: JSON.parse(system.examples),
      howItWorks: JSON.parse(system.howItWorks),
      pros: JSON.parse(system.pros),
      cons: JSON.parse(system.cons),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Simulate seat allocation using D'Hondt / FPTP methods
router.post("/electoral-systems/simulate", async (req, res) => {
  try {
    const { systemId, totalSeats, parties, threshold = 5 } = req.body;

    const eligible = parties.filter((p: any) => p.voteShare >= threshold);
    const totalVotes = eligible.reduce((sum: number, p: any) => sum + p.voteShare, 0);

    let results: any[] = [];

    if (systemId === "fptp") {
      // Winner takes all seats (simplified: top party wins)
      const sorted = [...eligible].sort((a, b) => b.voteShare - a.voteShare);
      results = eligible.map((p: any) => ({
        ...p,
        seats: p.name === sorted[0].name ? totalSeats : 0,
        seatShare: p.name === sorted[0].name ? 100 : 0,
      }));
    } else {
      // D'Hondt proportional method
      const seats = Object.fromEntries(eligible.map((p: any) => [p.name, 0]));
      for (let i = 0; i < totalSeats; i++) {
        let maxQuotient = -Infinity;
        let winner = "";
        for (const p of eligible) {
          const quotient = p.voteShare / (seats[p.name] + 1);
          if (quotient > maxQuotient) {
            maxQuotient = quotient;
            winner = p.name;
          }
        }
        seats[winner]++;
      }
      results = eligible.map((p: any) => ({
        ...p,
        seats: seats[p.name],
        seatShare: parseFloat(((seats[p.name] / totalSeats) * 100).toFixed(1)),
      }));
    }

    // Gallagher Index
    const gallagher = Math.sqrt(
      results.reduce((sum: number, p: any) => {
        return sum + Math.pow(p.voteShare - p.seatShare, 2) / 2;
      }, 0)
    );

    const winner = results.sort((a, b) => b.seats - a.seats)[0];
    const summary = `Under the ${systemId.toUpperCase()} system, ${winner?.name} wins the most seats with ${winner?.seats} out of ${totalSeats}. The Gallagher Index is ${gallagher.toFixed(2)}, indicating ${gallagher < 5 ? "high" : gallagher < 10 ? "moderate" : "low"} proportionality.`;

    res.json({ systemId, totalSeats, parties: results, gallagherIndex: parseFloat(gallagher.toFixed(2)), summary });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
