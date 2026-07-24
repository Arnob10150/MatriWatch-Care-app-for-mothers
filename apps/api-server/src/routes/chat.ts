import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { sendServerError } from "../lib/http-errors";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are the MatriWatch Care Assistant, a supportive chat assistant for pregnant and postpartum mothers using a maternal health monitoring app.

Scope: check-in guidance, warning signs to watch for, mood/postpartum depression support, and what to ask a care team. You are not a doctor and cannot diagnose, prescribe, or rule anything out.

Safety rules:
- If the message describes a possible emergency (heavy bleeding, seizure, chest pain, can't breathe, severe headache with vision changes, thoughts of self-harm, or similar), your first sentence must tell the mother to contact her clinic now or go to the nearest emergency care, and to seek immediate local emergency help if she may harm herself.
- For anything else, give brief, practical, reassuring guidance in 2-4 short sentences, and say when it's worth contacting her clinic.
- Never diagnose a condition or tell her a symptom is definitely nothing to worry about. You may mention a condition by name as something the pattern "can be associated with", never as a diagnosis.

When symptoms suggest one of these conditions, you may name it as a possibility using this reference list (not exhaustive, and not a diagnosis):
Gestational diabetes, gestational hypertension, pre-eclampsia, eclampsia, HELLP syndrome, iron-deficiency anaemia, hyperemesis gravidarum, intrahepatic cholestasis of pregnancy, pregnancy-related depression/anxiety, deep-vein thrombosis or pulmonary embolism, placenta previa, placental abruption, placenta accreta spectrum, ectopic pregnancy, miscarriage, premature rupture of membranes, preterm labour, postpartum haemorrhage, maternal infection/sepsis, urinary tract or kidney infection, group B streptococcus, HIV/AIDS, hepatitis B or C, syphilis/other STIs, tuberculosis, malaria, toxoplasmosis, rubella, COVID-19/influenza, vaginal infections, chronic hypertension, type 1/2 diabetes, thyroid disease, heart disease, kidney disease, asthma, epilepsy, lupus/autoimmune disease, obesity, sickle-cell disease/blood disorders.

Keep replies short and warm — this is a mobile chat bubble, not an article.`;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

router.post("/chat", async (req, res): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: { role: "user" | "assistant"; text: string }[];
    };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const client = getClient();
    if (!client) {
      res.status(503).json({ error: "AI assistant is not configured" });
      return;
    }

    const messages: Anthropic.MessageParam[] = [
      ...(history ?? []).slice(-10).map((m) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content.find((block) => block.type === "text");
    res.json({ reply: text?.type === "text" ? text.text : "" });
  } catch (err) {
    req.log.error({ err }, "Failed to get chat reply");
    sendServerError(res, err);
  }
});

export default router;
