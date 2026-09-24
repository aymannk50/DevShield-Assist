import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { securityRules } from "./rules";
import type { SecurityFinding } from "./types";

const supportedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".env",
  ".yml",
  ".yaml",
]);

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
]);

export async function scanFile(filePath: string): Promise<SecurityFinding[]> {
  const content = await readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const findings: SecurityFinding[] = [];

  lines.forEach((lineContent, index) => {
    for (const rule of securityRules) {
      if (rule.pattern.test(lineContent)) {
        findings.push({
          ruleId: rule.id,
          title: rule.title,
          description: rule.description,
          severity: rule.severity,
          file: filePath,
          line: index + 1,
          recommendation: rule.recommendation,
        });
      }
    }
  });

  return findings;
}

export async function scanDirectory(
  directoryPath: string,
): Promise<SecurityFinding[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const findings: SecurityFinding[] = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      findings.push(...(await scanDirectory(fullPath)));
      continue;
    }

    const extension = extname(entry.name);

    if (supportedExtensions.has(extension) || entry.name.startsWith(".env")) {
      findings.push(...(await scanFile(fullPath)));
    }
  }

  return findings;
}