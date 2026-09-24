# DevShield Assist

DevShield Assist is an open-source developer security assistant that detects exposed secrets and insecure coding patterns before they reach production.

## Current capabilities

- Detect possible hardcoded passwords
- Detect possible exposed API keys
- Detect private keys
- Detect unsafe `eval()` usage
- Report severity, file, line number, and remediation guidance
- Add security annotations to GitHub pull requests
- Fail builds when high-risk findings are detected

## Use in GitHub Actions

Create `.github/workflows/devshield.yml` in your project:

```yaml
name: DevShield Security Scan

on:
  push:
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run DevShield Assist
        uses: aymannk50/DevShield-Assist@v1
        with:
          path: "."
```

## Local usage

```bash
npm install
npm run scan -- .
```

## Development

```bash
npm run check
npm run build:action
```

## Roadmap

- Dependency vulnerability scanning
- Infrastructure as Code scanning
- Container security scanning
- VS Code extension
- AI-assisted remediation
- CLI and MCP integrations

## Status

DevShield Assist is currently under active development. The initial version provides an extensible security scanning foundation.

## Author

Created by Ayman Naeem.