import * as vscode from "vscode";
import { scanDirectory, scanFile } from "./scanner";
import type { SecurityFinding, Severity } from "./types";

const diagnostics =
  vscode.languages.createDiagnosticCollection("devshield");

function diagnosticSeverity(severity: Severity): vscode.DiagnosticSeverity {
  switch (severity) {
    case "critical":
    case "high":
      return vscode.DiagnosticSeverity.Error;

    case "medium":
      return vscode.DiagnosticSeverity.Warning;

    case "low":
      return vscode.DiagnosticSeverity.Information;
  }
}

function showFindings(findings: SecurityFinding[]): void {
  diagnostics.clear();

  const findingsByFile = new Map<string, SecurityFinding[]>();

  for (const finding of findings) {
    const currentFindings = findingsByFile.get(finding.file) ?? [];
    currentFindings.push(finding);
    findingsByFile.set(finding.file, currentFindings);
  }

  for (const [filePath, fileFindings] of findingsByFile) {
    const fileDiagnostics = fileFindings.map((finding) => {
      const line = Math.max(finding.line - 1, 0);
      const range = new vscode.Range(line, 0, line, 1000);

      const diagnostic = new vscode.Diagnostic(
        range,
        `${finding.title}: ${finding.description}\nFix: ${finding.recommendation}`,
        diagnosticSeverity(finding.severity),
      );

      diagnostic.source = "DevShield Assist";
      diagnostic.code = finding.ruleId;

      return diagnostic;
    });

    diagnostics.set(vscode.Uri.file(filePath), fileDiagnostics);
  }
}

async function scanCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage("DevShield Assist: No file is open.");
    return;
  }

  await editor.document.save();

  const findings = await scanFile(editor.document.uri.fsPath);
  showFindings(findings);

  if (findings.length === 0) {
    vscode.window.showInformationMessage(
      "DevShield Assist: No security issues found.",
    );
  } else {
    vscode.window.showWarningMessage(
      `DevShield Assist found ${findings.length} security issue(s).`,
    );
  }
}

async function scanWorkspace(): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      "DevShield Assist: Open a project folder first.",
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevShield Assist is scanning your project...",
      cancellable: false,
    },
    async () => {
      const findings = await scanDirectory(workspaceFolder.uri.fsPath);
      showFindings(findings);

      if (findings.length === 0) {
        vscode.window.showInformationMessage(
          "DevShield Assist: No security issues found.",
        );
      } else {
        vscode.window.showWarningMessage(
          `DevShield Assist found ${findings.length} security issue(s). Check the Problems panel.`,
        );
      }
    },
  );
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    diagnostics,
    vscode.commands.registerCommand(
      "devshield.scanCurrentFile",
      scanCurrentFile,
    ),
    vscode.commands.registerCommand(
      "devshield.scanWorkspace",
      scanWorkspace,
    ),
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const findings = await scanFile(document.uri.fsPath);
      showFindings(findings);
    }),
  );
}

export function deactivate(): void {
  diagnostics.clear();
}