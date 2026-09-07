// Runs eval/dataset.ts through the exact same analyzeLog() pipeline the app uses in
// production, and reports how often the model's severity classification matches the
// hand-labeled ground truth. This is what turns "the model claims high confidence" into
// an actual measured number you can put on a resume.
//
// Usage:
//   npm run eval
//
// Requires GEMINI_API_KEY to be set in .env.local (same file the app itself uses).

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { analyzeLog } from "../src/lib/analyze";
import { dataset, EvalItem } from "./dataset";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DELAY_MS = Number(process.env.EVAL_DELAY_MS || 4000);

interface EvalResult {
  id: string;
  expected: string;
  actual: string;
  match: boolean;
  confidence: number;
  title: string;
  error?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runOne(item: EvalItem): Promise<EvalResult> {
  try {
    const result = await analyzeLog(item.log, { sourceSystem: item.sourceSystem });
    return {
      id: item.id,
      expected: item.expectedSeverity,
      actual: result.severity,
      match: result.severity === item.expectedSeverity,
      confidence: result.confidence,
      title: result.title,
    };
  } catch (err) {
    return {
      id: item.id,
      expected: item.expectedSeverity,
      actual: "ERROR",
      match: false,
      confidence: 0,
      title: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY is not set in .env.local. Add it before running the eval."
    );
    process.exit(1);
  }

  console.log(`Running evaluation on ${dataset.length} labeled incidents...\n`);

  const results: EvalResult[] = [];

  for (const item of dataset) {
    process.stdout.write(`  ${item.id.padEnd(32)} ... `);
    const result = await runOne(item);
    results.push(result);

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else {
      const marker = result.match ? "MATCH" : "MISS ";
      console.log(
        `${marker}  expected=${result.expected.padEnd(8)} actual=${result.actual.padEnd(8)} confidence=${(
          result.confidence * 100
        ).toFixed(0)}%`
      );
    }

    await sleep(DELAY_MS);
  }

  const successful = results.filter((r) => !r.error);
  const correct = successful.filter((r) => r.match);
  const errored = results.filter((r) => r.error);

  const accuracy = successful.length > 0 ? (correct.length / successful.length) * 100 : 0;
  const avgConfidenceCorrect =
    correct.length > 0
      ? correct.reduce((sum, r) => sum + r.confidence, 0) / correct.length
      : 0;
  const incorrect = successful.filter((r) => !r.match);
  const avgConfidenceIncorrect =
    incorrect.length > 0
      ? incorrect.reduce((sum, r) => sum + r.confidence, 0) / incorrect.length
      : 0;

  console.log("\n" + "─".repeat(60));
  console.log(`Accuracy:                ${correct.length}/${successful.length} (${accuracy.toFixed(1)}%)`);
  console.log(`Avg confidence (correct):   ${(avgConfidenceCorrect * 100).toFixed(1)}%`);
  if (incorrect.length > 0) {
    console.log(`Avg confidence (incorrect): ${(avgConfidenceIncorrect * 100).toFixed(1)}%`);
  }
  if (errored.length > 0) {
    console.log(`Errors:                   ${errored.length} item(s) failed to run — see eval/results.json`);
  }
  console.log("─".repeat(60));

  if (incorrect.length > 0) {
    console.log("\nMisclassified:");
    for (const r of incorrect) {
      console.log(`  ${r.id}: expected ${r.expected}, got ${r.actual} (confidence ${(r.confidence * 100).toFixed(0)}%)`);
    }
  }

  const outPath = path.join(process.cwd(), "eval", "results.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        run_at: new Date().toISOString(),
        total: dataset.length,
        accuracy_pct: Number(accuracy.toFixed(1)),
        avg_confidence_correct: Number((avgConfidenceCorrect * 100).toFixed(1)),
        avg_confidence_incorrect: Number((avgConfidenceIncorrect * 100).toFixed(1)),
        results,
      },
      null,
      2
    )
  );
  console.log(`\nFull results written to eval/results.json`);
}

main();
