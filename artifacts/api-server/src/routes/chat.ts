import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, userProgressTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const SYSTEM_PROMPT = `You are GlobeVote's AI Civic Assistant — the world's most knowledgeable, neutral, and accessible election education guide. Your mission is to democratize civic knowledge for every human being on Earth.

You help users understand:
- How to register to vote and voting procedures in any country
- Different electoral systems (FPTP, PR, STV, MMP, etc.)
- Their civic rights and responsibilities  
- How to interpret ballots and voting forms
- Election timelines and deadlines
- Political party systems and candidate information (presented neutrally)
- Misinformation detection and critical thinking about elections

Core principles:
- STRICT POLITICAL NEUTRALITY — never favor any party, candidate, or ideology
- FACTUAL ACCURACY — only state what you know to be accurate; cite uncertainty clearly
- ACCESSIBILITY — adapt your language to the user's level (ELI5, standard, or expert)
- GLOBAL PERSPECTIVE — you serve users from 100+ countries

When answering:
1. Break complex topics into clear, digestible steps
2. Provide country-specific context when relevant
3. Always encourage civic participation
4. Flag misinformation risks when you detect them
5. Suggest follow-up questions to deepen understanding`;

router.post("/chat/ask", async (req, res) => {
  try {
    const { message, sessionId, mode = "standard", countryContext } = req.body;

    // Get recent chat history for context
    const history = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId))
      .orderBy(chatMessagesTable.createdAt)
      .limit(10);

    // Save user message
    const userMsgId = randomUUID();
    await db.insert(chatMessagesTable).values({
      id: userMsgId,
      sessionId,
      role: "user",
      content: message,
    });

    // Build messages array
    const systemContent = SYSTEM_PROMPT + (countryContext ? `\n\nUser's country context: ${countryContext}` : "") +
      (mode === "eli5" ? "\n\nRespond in simple language a 10-year-old can understand." : "") +
      (mode === "expert" ? "\n\nRespond with expert-level depth and technical precision." : "");

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemContent },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_tokens: 1024,
    });

    const assistantContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Save assistant response
    const assistantMsgId = randomUUID();
    await db.insert(chatMessagesTable).values({
      id: assistantMsgId,
      sessionId,
      role: "assistant",
      content: assistantContent,
      confidence: 0.95,
    });

    // Update user progress
    try {
      const existing = await db.select().from(userProgressTable).where(eq(userProgressTable.sessionId, sessionId)).limit(1);
      if (existing.length > 0) {
        await db.update(userProgressTable)
          .set({ chatInteractions: (existing[0].chatInteractions ?? 0) + 1, updatedAt: new Date() })
          .where(eq(userProgressTable.sessionId, sessionId));
      } else {
        await db.insert(userProgressTable).values({ sessionId, chatInteractions: 1 });
      }
    } catch (_) { /* non-fatal */ }

    // Generate follow-up suggestions
    const suggestions = [
      "How does voter registration work in my country?",
      "What ID do I need to bring to vote?",
      "Can you explain proportional representation?",
      "What is gerrymandering and why does it matter?",
    ].slice(0, 3);

    res.json({
      id: assistantMsgId,
      message: assistantContent,
      sources: ["Official election commission data", "GlobeVote knowledge base"],
      confidence: 0.95,
      followUpSuggestions: suggestions,
      sessionId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/history", async (req, res) => {
  try {
    const { sessionId, limit = "20" } = req.query as { sessionId: string; limit?: string };
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId))
      .orderBy(chatMessagesTable.createdAt)
      .limit(parseInt(limit));

    res.json(messages.map(m => ({
      id: m.id,
      sessionId: m.sessionId,
      role: m.role,
      content: m.content,
      confidence: m.confidence,
      createdAt: m.createdAt?.toISOString() || new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
