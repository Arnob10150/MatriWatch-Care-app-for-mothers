"use client";

import { useMemo, useRef, useState } from "react";
import { HeartPulse, MessageCircle, Send, X } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

type ChatMessage = {
  id: number;
  role: "bot" | "mother";
  text: string;
};

const QUICK_PROMPTS = [
  "When should I call my clinic?",
  "I feel dizzy",
  "Help me with mood",
  "What should I track today?",
];

function buildReply(input: string): string {
  const text = input.toLowerCase();

  if (/(bleeding|seizure|chest pain|can't breathe|cannot breathe|suicid|harm myself|faint)/.test(text)) {
    return "This could be urgent. Please contact your clinic now or go to the nearest emergency care. If you may hurt yourself, seek immediate local emergency help and tell someone nearby.";
  }

  if (/(headache|blurred|vision|swelling|blood pressure|bp)/.test(text)) {
    return "Headache with blurred vision, swelling, or high blood pressure needs same-day review. Rest on your left side if you can, avoid heavy activity, and contact your clinic.";
  }

  if (/(dizzy|dizziness|weak|tired|nausea|vomit)/.test(text)) {
    return "Dizziness can happen, but it matters if it is strong or repeated. Drink water, sit or lie down, eat something light if you can, and tell your clinic if it continues or comes with bleeding, fever, severe headache, or pain.";
  }

  if (/(sad|mood|cry|anxious|panic|depress|sleep)/.test(text)) {
    return "Thank you for saying that. You are not alone. If these feelings are strong, getting worse, or making daily care hard, complete the Mood Check and contact your clinic. If you think about harming yourself, seek emergency help now.";
  }

  if (/(track|check|today|reading|vital)/.test(text)) {
    return "For today's check-in, record blood pressure, blood sugar, temperature, heart rate, symptoms, and any notes about pain, bleeding, fetal movement, sleep, or mood.";
  }

  return "I can help with check-ins, warning signs, mood support, and what to ask your clinic. I cannot diagnose you, so if something feels serious or unusual, please contact your care team.";
}

export function MotherChatbot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Hi, I am MatriWatch Care Assistant. Tell me what you are feeling or ask about check-ins, warning signs, or mood support.",
    },
  ]);
  const nextId = useRef(2);

  const title = useMemo(() => (open ? "Care Assistant" : "Open care assistant"), [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const history = messages.map((m) => ({ role: m.role === "mother" ? "user" : "assistant", text: m.text }));
    const motherMessage: ChatMessage = { id: nextId.current++, role: "mother", text: trimmed };
    setMessages((current) => [...current, motherMessage]);
    setDraft("");
    setSending(true);

    let replyText: string;
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { reply: string };
      replyText = data.reply || buildReply(trimmed);
    } catch {
      replyText = buildReply(trimmed);
    }

    const botMessage: ChatMessage = { id: nextId.current++, role: "bot", text: replyText };
    setMessages((current) => [...current, botMessage]);
    setSending(false);
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
      {open && (
        <div
          className="mb-3 flex h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:w-96"
          style={{ borderColor: "#EDE8E3" }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: "#C97C8A" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Care Assistant</p>
                <p className="text-xs text-white/75">For mothers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-white/15"
              aria-label="Close care assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ backgroundColor: "#FFF8F0" }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                  message.role === "mother" ? "ml-auto text-white" : "mr-auto bg-white text-[#2D2D2D]"
                }`}
                style={{
                  backgroundColor: message.role === "mother" ? "#C97C8A" : "#FFFFFF",
                  boxShadow: message.role === "bot" ? "0 1px 4px rgba(201,124,138,0.08)" : undefined,
                }}
              >
                {message.text}
              </div>
            ))}
            {sending && (
              <div
                className="mr-auto max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 text-[#2D2D2D]"
                style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
              >
                Typing…
              </div>
            )}
          </div>

          <div className="border-t bg-white px-3 py-3" style={{ borderColor: "#EDE8E3" }}>
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
  onClick={() => send(prompt)}
                  disabled={sending}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  style={{ borderColor: "#EDE8E3", color: "#C97C8A", backgroundColor: "#FFF8F0" }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send(draft);
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your question"
                className="min-h-11 flex-1 rounded-xl border px-3 text-sm outline-none"
                style={{ borderColor: "#EDE8E3", color: "#2D2D2D" }}
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: "#C97C8A" }}
                disabled={!draft.trim() || sending}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95"
        style={{ backgroundColor: "#C97C8A", boxShadow: "0 10px 30px rgba(201,124,138,0.35)" }}
        aria-label={title}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
