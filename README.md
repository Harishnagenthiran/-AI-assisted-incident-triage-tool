# Rootline — AI Incident Triage & RCA Assistant

Paste a log excerpt, stack trace, or incident description. Rootline classifies severity,
drafts a root-cause hypothesis grounded in the specific evidence in the log, and proposes
concrete resolution steps — the first-pass triage an on-call engineer does manually, automated.

Every triage is saved to a local incident history so you can see patterns over time.

## Stack

- **Next.js 16** (App Router, TypeScript) — single deployable for frontend + API
- **Gemini API** (`@google/genai`) — severity classification, RCA, resolution steps via a
  structured JSON contract with defensive parsing/coercion
- **JSON-file persistence** (`src/lib/db.ts`) — zero-config local storage for incident history,
  written with plain Node `fs`. No native modules, no compiler required, works identically on
  Windows, macOS, and Linux out of the box.
- **Tailwind CSS v4** — custom dark "ops console" design system (see `src/app/globals.css`)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then add your Gemini API key
npm run dev
```

Open http://localhost:3000. Click "load sample" on the home page to try it without pasting
your own log first.

Get a free API key at https://aistudio.google.com/apikey.

## Project structure

```
src/
  app/
    page.tsx                 New triage workspace
    history/page.tsx         Incident history table
    incidents/[id]/page.tsx  Incident detail (raw log + full analysis)
    api/
      analyze/route.ts       POST — runs a log through Gemini, persists, returns result
      incidents/route.ts     GET  — list history + severity stats
      incidents/[id]/route.ts GET/DELETE — single incident
  components/                UI components (severity badges, result panel, etc.)
  lib/
    analyze.ts                Gemini prompt, request, and response validation
    db.ts                     JSON-file storage + queries
    types.ts                  Shared client-safe types
```

## Design notes

- The prompt in `lib/analyze.ts` instructs the model to ground its analysis in the literal
  text it was given rather than inventing service names or line numbers, and to lower its
  confidence score when the log is ambiguous rather than guess — a hallucination-mitigation
  pattern worth calling out if this comes up in an interview.
- The Gemini call sets `responseMimeType: "application/json"` to bias the model toward valid
  JSON, but `lib/analyze.ts` still never trusts the output at face value: `coerceResult()`
  validates and falls back on every field before it reaches storage or the UI.
- Incident history lives in a local JSON file at `data/rootline.json` (gitignored). No log data
  is sent anywhere except the Gemini API for analysis. This is intentionally simple — fine for
  a single-user demo. For real concurrent usage, swap `lib/db.ts` for a proper database; the
  query surface is small and isolated to that one file.

## Measuring accuracy

`eval/dataset.ts` has 16 hand-labeled incidents (4 per severity level) with a human-judgment
ground-truth severity for each. `eval/run-eval.ts` runs every one through the exact same
`analyzeLog()` pipeline the app uses, then reports how often the model's classification matches:

```bash
npm run eval
```

This calls the Gemini API 16 times (with a small delay between calls to stay under free-tier
rate limits), then prints per-item results plus overall accuracy, and writes the full detail to
`eval/results.json`. Use the real number this prints — not a guess — anywhere you cite accuracy
for this project (resume, interview, etc.). A sample resume phrasing once you have the number:

> ...achieving `<accuracy>`% severity-classification accuracy against a 16-incident hand-labeled
> evaluation set.

Want a stronger claim? Add more labeled incidents to `eval/dataset.ts` (real anonymized logs
from work are ideal, if you're comfortable using them) — a 16-item set is enough to demonstrate
the *method*, but a real accuracy claim is more credible off 50+ examples.

## Deploying

This runs anywhere Next.js does. For a quick public demo:

1. Push to a GitHub repo.
2. Import it on [Vercel](https://vercel.com/new).
3. Add `GEMINI_API_KEY` as an environment variable in the Vercel project settings.

Note: the JSON-file store on Vercel's serverless functions doesn't persist between deploys or
across function instances (the filesystem is ephemeral). For a demo that's usually fine — for
durable history in production, swap `lib/db.ts` for a hosted database (Postgres via
Neon/Supabase, Turso, etc.); the query surface is small and isolated to that one file.

## Using this on your resume

This project is designed to demonstrate:
- End-to-end product thinking: identifying a real workflow (manual log triage) and shipping
  a tool that automates the first pass of it
- LLM integration done carefully: structured output contracts, response validation, and
  explicit handling of model uncertainty — not just "call the API and hope"
- Full-stack ownership: schema design, API routes, and a UI built around the actual shape
  of the data rather than a generic CRUD template

Example resume bullet:
> Built and shipped an AI-assisted incident triage tool (Next.js, TypeScript, Gemini API) that
> classifies severity and drafts root-cause hypotheses from raw logs, with structured-output
> validation to guard against hallucinated evidence.
