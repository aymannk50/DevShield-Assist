import type { Severity } from "./types";

export interface SecurityRule {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  pattern: RegExp;
  recommendation: string;
}

export const securityRules: SecurityRule[] = [
  {
    id: "DSA-001",
    title: "Possible hardcoded password",
    description: "A password may be stored directly in the source code.",
    severity: "high",
    pattern: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
    recommendation: "Store passwords in environment variables or a secret manager.",
  },
  {
    id: "DSA-002",
    title: "Possible exposed API key",
    description: "An API key may be stored directly in the source code.",
    severity: "critical",
    pattern: /(api[_-]?key|apikey)\s*[:=]\s*["'][^"']{8,}["']/i,
    recommendation: "Remove the key and store it in a protected secret.",
  },
  {
    id: "DSA-003",
    title: "Unsafe eval usage",
    description: "eval() can execute untrusted code.",
    severity: "high",
    pattern: /(?:^|[=(:,;{}]\s*)\beval\s*\(/,
    recommendation: "Replace eval() with a safer parsing or execution method.",
  },
  {
    id: "DSA-004",
    title: "Possible private key",
    description: "A private key appears to be included in the file.",
    severity: "critical",
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    recommendation: "Remove and rotate the key immediately.",
  },
];