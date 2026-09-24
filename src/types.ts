export type Severity = "critical" | "high" | "medium" | "low";

export interface SecurityFinding {
  ruleId: string;
  title: string;
  description: string;
  severity: Severity;
  file: string;
  line: number;
  recommendation: string;
}