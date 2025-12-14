import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function walkFiles(dir: string, ignoreDirs: Set<string>): string[] {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (ignoreDirs.has(ent.name)) continue;
      out.push(...walkFiles(path.join(dir, ent.name), ignoreDirs));
      continue;
    }
    if (ent.isFile()) {
      out.push(path.join(dir, ent.name));
    }
  }
  return out;
}

function readTextSafe(filePath: string): string {
  // テキスト前提（バイナリが混ざる可能性は低いが念のため）
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

describe("Japanese-only guardrails", () => {
  it("should not contain language switching remnants in app/ (locale===en / lang=en)", () => {
    const repoRoot = process.cwd();
    const appDir = path.join(repoRoot, "app");

    const files = walkFiles(appDir, new Set(["node_modules", ".next"])).filter(
      (f) =>
        f.endsWith(".ts") ||
        f.endsWith(".tsx") ||
        f.endsWith(".js") ||
        f.endsWith(".jsx") ||
        f.endsWith(".md"),
    );

    const forbiddenPatterns: Array<{ name: string; re: RegExp }> = [
      { name: 'locale === "en"', re: /locale\s*===\s*["']en["']/g },
      { name: "lang=en", re: /(?:\?|&)?lang=en\b/g },
    ];

    const hits: Array<{ file: string; pattern: string }> = [];

    for (const f of files) {
      const text = readTextSafe(f);
      if (!text) continue;

      for (const ptn of forbiddenPatterns) {
        if (ptn.re.test(text)) {
          hits.push({ file: path.relative(repoRoot, f), pattern: ptn.name });
          // 次のパターンに行く前に lastIndex を戻す（/g の副作用対策）
          ptn.re.lastIndex = 0;
        } else {
          ptn.re.lastIndex = 0;
        }
      }
    }

    expect(
      hits,
      `日本語専用化の防波堤: app/ に言語切替の残骸が残っています。\n` +
        hits.map((h) => `- ${h.file} (${h.pattern})`).join("\n"),
    ).toEqual([]);
  });
});


