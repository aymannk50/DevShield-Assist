import * as core from "@actions/core";
import { relative, resolve } from "node:path";
import { scanDirectory } from "./scanner";

async function run(): Promise<void> {
  try {
    const inputPath = core.getInput("path") || ".";
    const targetDirectory = resolve(process.cwd(), inputPath);

    core.info(`DevShield Assist is scanning: ${targetDirectory}`);

    const findings = await scanDirectory(targetDirectory);

    core.setOutput("findings-count", findings.length.toString());

    if (findings.length === 0) {
      core.info("No security issues found.");
      return;
    }

    for (const finding of findings) {
      const file = relative(process.cwd(), finding.file).replaceAll("\\", "/");
      const message = `${finding.description} Fix: ${finding.recommendation}`;

      const annotation = {
        title: `${finding.ruleId}: ${finding.title}`,
        file,
        startLine: finding.line,
        endLine: finding.line,
      };

      if (
        finding.severity === "critical" ||
        finding.severity === "high"
      ) {
        core.error(message, annotation);
      } else {
        core.warning(message, annotation);
      }
    }

    const blockingFindings = findings.filter(
      (finding) =>
        finding.severity === "critical" ||
        finding.severity === "high",
    );

    if (blockingFindings.length > 0) {
      core.setFailed(
        `DevShield Assist found ${blockingFindings.length} high-risk security issue(s).`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(`DevShield Assist failed: ${message}`);
  }
}

void run();