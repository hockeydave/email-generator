# Cold Email Generator

A clean single-page app with a form to generate a tailored cold email for a business.

## Form fields
- Business name (text)
- Industry (text)
- City (text)
- Tone of email (select: Professional, Friendly, Casual, Persuasive, Witty)
- "Generate Email" button

## Behavior
1. User fills in the four fields and clicks Generate Email.
2. Client-side validation (zod): all fields required, reasonable max lengths.
3. App calls a TanStack server function that uses Lovable AI Gateway (google/gemini-2.5-flash, free during promo) to generate a cold email with a clear subject + body, using the four inputs.
4. Result renders below the form in a card with a "Copy to clipboard" button. Loading state on the button while generating; toast on error.

## Design
Clean, minimal, single centered card on a soft neutral background. Generous whitespace, rounded inputs, one primary action button. Uses existing shadcn/Tailwind tokens — no hardcoded colors.

## Technical
- Enable Lovable Cloud (needed for AI Gateway server-side calls).
- New route: `src/routes/index.tsx` replaces the placeholder with the form UI (client component using react-hook-form + zod).
- New server function: `src/lib/generate-email.functions.ts` — `createServerFn` POST, validates input with zod, calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`, returns `{ email: string }`. Handles 429/402 with friendly errors.
- Page meta: title "Cold Email Generator", matching description/OG tags.

No database, no auth — purely a generator.
