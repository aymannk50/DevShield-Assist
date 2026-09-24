"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));

// src/scanner.ts
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");

// src/rules.ts
var securityRules = [
  {
    id: "DSA-001",
    title: "Possible hardcoded password",
    description: "A password may be stored directly in the source code.",
    severity: "high",
    pattern: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
    recommendation: "Store passwords in environment variables or a secret manager."
  },
  {
    id: "DSA-002",
    title: "Possible exposed API key",
    description: "An API key may be stored directly in the source code.",
    severity: "critical",
    pattern: /(api[_-]?key|apikey)\s*[:=]\s*["'][^"']{8,}["']/i,
    recommendation: "Remove the key and store it in a protected secret."
  },
  {
    id: "DSA-003",
    title: "Unsafe eval usage",
    description: "eval() can execute untrusted code.",
    severity: "high",
    pattern: /(?:^|[=(:,;{}]\s*)\beval\s*\(/,
    recommendation: "Replace eval() with a safer parsing or execution method."
  },
  {
    id: "DSA-004",
    title: "Possible private key",
    description: "A private key appears to be included in the file.",
    severity: "critical",
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    recommendation: "Remove and rotate the key immediately."
  }
];

// src/scanner.ts
var supportedExtensions = /* @__PURE__ */ new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".env",
  ".yml",
  ".yaml"
]);
var ignoredDirectories = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage"
]);
async function scanFile(filePath) {
  const content = await (0, import_promises.readFile)(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const findings = [];
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
          recommendation: rule.recommendation
        });
      }
    }
  });
  return findings;
}
async function scanDirectory(directoryPath) {
  const entries = await (0, import_promises.readdir)(directoryPath, { withFileTypes: true });
  const findings = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const fullPath = (0, import_node_path.join)(directoryPath, entry.name);
    if (entry.isDirectory()) {
      findings.push(...await scanDirectory(fullPath));
      continue;
    }
    const extension = (0, import_node_path.extname)(entry.name);
    if (supportedExtensions.has(extension) || entry.name.startsWith(".env")) {
      findings.push(...await scanFile(fullPath));
    }
  }
  return findings;
}

// src/extension.ts
var diagnostics = vscode.languages.createDiagnosticCollection("devshield");
function diagnosticSeverity(severity) {
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
function showFindings(findings) {
  diagnostics.clear();
  const findingsByFile = /* @__PURE__ */ new Map();
  for (const finding of findings) {
    const currentFindings = findingsByFile.get(finding.file) ?? [];
    currentFindings.push(finding);
    findingsByFile.set(finding.file, currentFindings);
  }
  for (const [filePath, fileFindings] of findingsByFile) {
    const fileDiagnostics = fileFindings.map((finding) => {
      const line = Math.max(finding.line - 1, 0);
      const range = new vscode.Range(line, 0, line, 1e3);
      const diagnostic = new vscode.Diagnostic(
        range,
        `${finding.title}: ${finding.description}
Fix: ${finding.recommendation}`,
        diagnosticSeverity(finding.severity)
      );
      diagnostic.source = "DevShield Assist";
      diagnostic.code = finding.ruleId;
      return diagnostic;
    });
    diagnostics.set(vscode.Uri.file(filePath), fileDiagnostics);
  }
}
async function scanCurrentFile() {
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
      "DevShield Assist: No security issues found."
    );
  } else {
    vscode.window.showWarningMessage(
      `DevShield Assist found ${findings.length} security issue(s).`
    );
  }
}
async function scanWorkspace() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      "DevShield Assist: Open a project folder first."
    );
    return;
  }
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevShield Assist is scanning your project...",
      cancellable: false
    },
    async () => {
      const findings = await scanDirectory(workspaceFolder.uri.fsPath);
      showFindings(findings);
      if (findings.length === 0) {
        vscode.window.showInformationMessage(
          "DevShield Assist: No security issues found."
        );
      } else {
        vscode.window.showWarningMessage(
          `DevShield Assist found ${findings.length} security issue(s). Check the Problems panel.`
        );
      }
    }
  );
}
function activate(context) {
  context.subscriptions.push(
    diagnostics,
    vscode.commands.registerCommand(
      "devshield.scanCurrentFile",
      scanCurrentFile
    ),
    vscode.commands.registerCommand(
      "devshield.scanWorkspace",
      scanWorkspace
    ),
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const findings = await scanFile(document.uri.fsPath);
      showFindings(findings);
    })
  );
}
function deactivate() {
  diagnostics.clear();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
