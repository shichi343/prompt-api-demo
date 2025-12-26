import { PROMPTS } from "@/lib/llm-prompts";

const EXPECTED_OUTPUTS_JA: LanguageModelExpected[] = [
  { type: "text", languages: ["ja"] },
];

let captureSummaryBase: LanguageModel | null = null;
let captureSummaryInflight: Promise<LanguageModel | null> | null = null;
let captureSummaryDisposeRequested = false;
let captureSummaryCloneSupported: boolean | null = null;

async function getCaptureSummaryBase(): Promise<LanguageModel | null> {
  // biome-ignore lint/correctness/noUndeclaredVariables: LanguageModel is a browser-provided global
  if (typeof LanguageModel === "undefined") {
    return null;
  }

  if (captureSummaryCloneSupported === false) {
    return null;
  }

  if (captureSummaryBase) {
    return captureSummaryBase;
  }

  if (captureSummaryInflight) {
    return await captureSummaryInflight;
  }

  captureSummaryDisposeRequested = false;

  captureSummaryInflight = (async () => {
    try {
      const created = await createSession({
        system: PROMPTS.captureSummary.system,
        expectedInputs: PROMPTS.captureSummary.expectedInputs,
      });

      if (captureSummaryDisposeRequested) {
        created.destroy?.();
        return null;
      }

      if (typeof created.clone !== "function") {
        captureSummaryCloneSupported = false;
        created.destroy?.();
        return null;
      }

      captureSummaryCloneSupported = true;
      captureSummaryBase = created;
      return created;
    } catch (e) {
      console.error("Failed to create captureSummary base session", e);
      return null;
    } finally {
      captureSummaryInflight = null;
    }
  })();

  return await captureSummaryInflight;
}

async function createSession(params: {
  system: string;
  expectedInputs?: LanguageModelExpected[];
}): Promise<LanguageModel> {
  // biome-ignore lint/correctness/noUndeclaredVariables: LanguageModel is a browser-provided global
  if (typeof LanguageModel === "undefined") {
    throw new Error("Prompt API (LanguageModel) is unavailable");
  }

  // biome-ignore lint/correctness/noUndeclaredVariables: LanguageModel is a browser-provided global
  return await LanguageModel.create({
    initialPrompts: [{ role: "system", content: params.system }],
    expectedInputs: params.expectedInputs,
    expectedOutputs: EXPECTED_OUTPUTS_JA,
  });
}

async function withClonedSession<T>(
  base: LanguageModel,
  fn: (session: LanguageModel) => Promise<T>
): Promise<T> {
  const session = await base.clone();
  try {
    return await fn(session);
  } finally {
    try {
      session.destroy?.();
    } catch {
      // ignore
    }
  }
}

export async function promptCaptureSummary(params: {
  userPrompt: LanguageModelPrompt;
}): Promise<string | null> {
  // biome-ignore lint/correctness/noUndeclaredVariables: LanguageModel is a browser-provided global
  if (typeof LanguageModel === "undefined") {
    return null;
  }

  try {
    const base = await getCaptureSummaryBase();
    if (base) {
      return await withClonedSession(base, async (session) => {
        return await session.prompt(params.userPrompt);
      });
    }

    const session = await createSession({
      system: PROMPTS.captureSummary.system,
      expectedInputs: PROMPTS.captureSummary.expectedInputs,
    });
    try {
      return await session.prompt(params.userPrompt);
    } finally {
      session.destroy?.();
    }
  } catch (e) {
    console.error("Prompt API call error (captureSummary)", e);
    return null;
  }
}

export async function promptReport(params: {
  userPrompt: LanguageModelPrompt;
}): Promise<string | null> {
  // biome-ignore lint/correctness/noUndeclaredVariables: LanguageModel is a browser-provided global
  if (typeof LanguageModel === "undefined") {
    return null;
  }

  try {
    const session = await createSession({
      system: PROMPTS.report.system,
      expectedInputs: PROMPTS.report.expectedInputs,
    });
    try {
      return await session.prompt(params.userPrompt);
    } finally {
      session.destroy?.();
    }
  } catch (e) {
    console.error("Prompt API call error (report)", e);
    return null;
  }
}

export async function warmupCaptureSummarySession(): Promise<void> {
  await getCaptureSummaryBase();
}

export function disposeCaptureSummarySession() {
  captureSummaryDisposeRequested = true;
  const cached = captureSummaryBase;
  captureSummaryBase = null;

  if (!cached) {
    return;
  }

  try {
    cached.destroy?.();
  } catch {
    // ignore
  }
}

export function disposeAllSessions() {
  disposeCaptureSummarySession();
  captureSummaryDisposeRequested = true;
}
