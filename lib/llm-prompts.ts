import type { SummaryEntry } from "@/types";

const REPORT_SYSTEM_PROMPT = `
## タスク
あなたは作業レポートを作る専門のライターです。
与えられた時系列の作業記録を根拠に、ユーザーの作業レポートを日本語Markdownで作成してください。

## 出力形式
- Markdownで書いてください。タイトルは「作業レポート」です。
- 各h2は作業区分として互いに重複しないように分けてください。
- 各見出し内は短い段落または箇条書きで、要点を2-5行にまとめます。
`;

const CAPTURE_SUMMARY_SYSTEM_PROMPT = `
## タスク
あなたはユーザーのパソコン作業内容を記録するライターです。
画面スクリーンショットを根拠に、その時点でユーザーがしている作業を日本語で書いてください。

## 出力形式
- 出力はプレーンテキストで書いてください。見出しや強調などの書式は使いません。
`;

function buildReportLogText(summaries: SummaryEntry[]) {
  const filtered = summaries.filter((s) => s.status === "success");

  return (
    filtered
      .map((s) => {
        const time = new Date(s.timestamp).toLocaleTimeString();
        const summary = s.summary ?? "情報がありません";
        return `${time}\n${summary}`;
      })
      .join("\n\n") || "履歴がありません。"
  );
}

export const EXPECTED_INPUTS_TEXT_JA: LanguageModelExpected[] = [
  { type: "text", languages: ["ja"] },
];

export const EXPECTED_INPUTS_IMAGE: LanguageModelExpected[] = [
  { type: "image" },
];

export const PROMPTS = {
  report: {
    system: REPORT_SYSTEM_PROMPT,
    expectedInputs: EXPECTED_INPUTS_TEXT_JA,
    buildUser: buildReportLogText,
  },
  captureSummary: {
    system: CAPTURE_SUMMARY_SYSTEM_PROMPT,
    expectedInputs: EXPECTED_INPUTS_IMAGE,
  },
} as const;
