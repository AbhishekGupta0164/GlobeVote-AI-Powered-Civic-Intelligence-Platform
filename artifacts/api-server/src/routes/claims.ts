import { Router } from "express";
import { db } from "@workspace/db";
import { claimsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";

const router = Router();

const CLAIM_VERIFICATION_PROMPT = `You are a rigorous election fact-checker with access to comprehensive knowledge about global elections, civic processes, and political systems. Your role is to verify claims about elections, voting, and civic matters with strict neutrality and accuracy.

For each claim, provide:
1. A verdict: "true", "mostly-true", "mixed", "mostly-false", "false", or "unverifiable"
2. A confidence score (0.0 to 1.0)
3. A clear explanation with evidence
4. Sources that would verify this (e.g., "Election Commission of India", "Federal Election Commission (USA)")
5. Any psychological manipulation techniques detected (e.g., "false urgency", "fear appeal", "loaded language", "cherry-picking")

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "true|mostly-true|mixed|mostly-false|false|unverifiable",
  "confidence": 0.0-1.0,
  "explanation": "Clear explanation of the verdict with evidence...",
  "sources": ["Source 1", "Source 2"],
  "manipulationFlags": ["technique1", "technique2"]
}`;

router.post("/claims/verify", async (req, res) => {
  try {
    const { claim, context, countryId } = req.body;

    const userMessage = `Claim to verify: "${claim}"${context ? `\nContext: ${context}` : ""}${countryId ? `\nCountry context: ${countryId}` : ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: CLAIM_VERIFICATION_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_completion_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        verdict: "unverifiable",
        confidence: 0.5,
        explanation: responseText,
        sources: [],
        manipulationFlags: [],
      };
    }

    const id = randomUUID();
    const verifiedAt = new Date();

    await db.insert(claimsTable).values({
      id,
      claim,
      verdict: parsed.verdict || "unverifiable",
      confidence: parsed.confidence || 0.5,
      explanation: parsed.explanation || "",
      sources: JSON.stringify(parsed.sources || []),
      manipulationFlags: JSON.stringify(parsed.manipulationFlags || []),
      countryId: countryId || null,
    });

    res.json({
      id,
      claim,
      verdict: parsed.verdict || "unverifiable",
      confidence: parsed.confidence || 0.5,
      explanation: parsed.explanation || "",
      sources: parsed.sources || [],
      manipulationFlags: parsed.manipulationFlags || [],
      verifiedAt: verifiedAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/claims/recent", async (req, res) => {
  try {
    const { limit = "10" } = req.query as { limit?: string };
    const rows = await db
      .select()
      .from(claimsTable)
      .orderBy(desc(claimsTable.verifiedAt))
      .limit(parseInt(limit));

    res.json(rows.map(c => ({
      id: c.id,
      claim: c.claim,
      verdict: c.verdict,
      confidence: c.confidence,
      explanation: c.explanation,
      sources: JSON.parse(c.sources),
      manipulationFlags: JSON.parse(c.manipulationFlags),
      verifiedAt: c.verifiedAt?.toISOString() || new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
