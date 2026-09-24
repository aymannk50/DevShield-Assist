import { resolve } from "node:path";
import { scanDirectory } from "./scanner";

async function main(): Promise<void> {
  const targetDirectory = resolve(process.argv[2] ?? process.cwd());

  console.log(`\nDevShield Assist`);
  console.log(`Scanning: ${targetDirectory}\n`);

  try {
    const findings = await scanDirectory(targetDirectory);

    if (findings.length === 0) {
      console.log("No security issues found.");
      process.exitCode = 0;
      return;
    }

    console.log(`Found ${findings.length} security issue(s):\n`);

    for (const finding of findings) {
      console.log(`[${finding.severity.toUpperCase()}] ${finding.title}`);
      console.log(`Rule: ${finding.ruleId}`);
      console.log(`Location: ${finding.file}:${finding.line}`);
      console.log(`Details: ${finding.description}`);
      console.log(`Fix: ${finding.recommendation}\n`);
    }

    const hasBlockingFinding = findings.some(
      (finding) =>
        finding.severity === "critical" || finding.severity === "high",
    );

    process.exitCode = hasBlockingFinding ? 1 : 0;
  } catch (error) {
    console.error("Scan failed:", error);
    process.exitCode = 2;
  }
}

void main();