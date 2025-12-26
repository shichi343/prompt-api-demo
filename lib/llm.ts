import { PROMPTS } from "@/lib/llm-prompts";
import {
  disposeAllSessions,
  disposeCaptureSummarySession,
  promptCaptureSummary,
  promptReport,
  warmupCaptureSummarySession,
} from "@/lib/session-pool";
import type { SummaryEntry } from "@/types";

export function disposeAllPromptApiSessions() {
  disposeAllSessions();
}

export async function warmupCaptureSummaryPromptSession() {
  await warmupCaptureSummarySession();
}

export function disposeCaptureSummaryPromptSession() {
  disposeCaptureSummarySession();
}

export async function generateReport(
  summaries: SummaryEntry[]
): Promise<{ markdown: string } | undefined> {
  const userPrompt = PROMPTS.report.buildUser(summaries);

  try {
    const result = await promptReport({ userPrompt });
    if (result) {
      return { markdown: result };
    }
  } catch (e) {
    console.error("Prompt API error (report)", e);
  }

  return undefined;
}

export async function generateCaptureSummary(params: {
  frameBlob?: Blob;
}): Promise<string | undefined> {
  const { frameBlob } = params;
  if (!frameBlob) {
    return undefined;
  }

  try {
    const messages: LanguageModelPrompt = [
      { role: "user", content: [{ type: "image", value: frameBlob }] },
    ];

    const result = await promptCaptureSummary({ userPrompt: messages });
    return result?.trim() || undefined;
  } catch (e) {
    console.error("Prompt API error (summary)", e);
  }

  return undefined;
}
