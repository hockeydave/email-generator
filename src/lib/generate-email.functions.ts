import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  tone: z.enum(["Professional", "Friendly", "Casual", "Persuasive", "Witty"]),
});

export type GenerateEmailInput = z.infer<typeof InputSchema>;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");

    const system =
      "You are an expert cold-email copywriter for a web design agency. " +
      "You write concise, personalized outreach emails to local businesses, pitching website design and redesign services. " +
      "Output ONLY the email itself in this exact format: a single 'Subject: ...' line, then a blank line, then the email body. " +
      "No preamble, no explanations, no markdown fences.";

    const user =
      `Write a cold outreach email from a web design agency to "${data.businessName}", ` +
      `a ${data.industry} business based in ${data.city}. ` +
      `Tone: ${data.tone}. ` +
      `Requirements:\n` +
      `- Compelling, specific subject line (under 60 characters) referencing the business or their industry.\n` +
      `- Personalized opener that shows you've thought about their business and city.\n` +
      `- Briefly explain how a modern website (or redesign) helps ${data.industry} businesses win more customers — keep it concrete, not generic.\n` +
      `- One clear, low-friction call to action at the end (e.g., a quick 15-minute call or a free homepage audit).\n` +
      `- Under 150 words total in the body.\n` +
      `- Sign off with [Your Name], Web Design Agency.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text);
      throw new Error("Failed to generate email. Please try again.");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const email = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!email) throw new Error("No email was generated. Please try again.");
    return { email };
  });
