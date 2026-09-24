# DevShield Assist

[DevShield Assist](images/icon.png)

**Security scanning directly inside Visual Studio Code.**

DevShield Assist helps developers detect exposed secrets and insecure coding patterns before code reaches production. Scan the current file or the entire project and view clear security findings directly in the VS Code Problems panel.

Developed by **Ayman Naeem**.

## Features

- Scan the currently open file
- Scan the entire project
- Detect possible hardcoded passwords
- Detect exposed API keys
- Detect private keys in source code
- Detect unsafe `eval()` usage
- Display file names and affected line numbers
- Classify findings by severity
- Provide practical remediation recommendations
- Run locally without uploading your source code
- Integrate with GitHub Actions

## Installation

### Install from Visual Studio Marketplace

1. Open Visual Studio Code.
2. Open the **Extensions** panel.
3. Search for `DevShield Assist`.
4. Select the extension published by **aymannk50**.
5. Click **Install**.

You can also install it directly from:

[DevShield Assist on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=aymannk50.devshield-assist)

## How to use

Open a project folder in Visual Studio Code before running a scan.

### Scan the current file

1. Open the file you want to scan.
2. Press `Ctrl+Shift+P`.
3. Search for:

```text
DevShield: Scan Current File
```

4. Press Enter.
5. Review detected issues in the **Problems** panel.

### Scan the entire project

1. Open your project folder in Visual Studio Code.
2. Press `Ctrl+Shift+P`.
3. Search for:

```text
DevShield: Scan Entire Project
```

4. Press Enter.
5. Open the **Problems** panel to review the findings.

You can open the Problems panel using:

```text
Ctrl+Shift+M
```

## Security checks

| Rule | Security check | Severity |
|---|---|---|
| DSA-001 | Possible hardcoded password | High |
| DSA-002 | Possible exposed API key | Critical |
| DSA-003 | Unsafe `eval()` usage | High |
| DSA-004 | Possible private key | Critical |

Every finding includes:

- Security rule ID
- Finding title
- Severity level
- File and line location
- Description of the risk
- Recommended remediation

## Example

DevShield Assist can identify code such as:

```typescript
const password = "demo-password";
const userInput = "2 + 2";

eval(userInput);
```

The findings are displayed inside the VS Code Problems panel with the affected location and a recommended fix.

> The example above is intentionally insecure and should only be used for testing.

## GitHub Actions integration

DevShield Assist can also scan repositories automatically using GitHub Actions.

Create this file in your repository:

```text
.github/workflows/devshield.yml
```

Add the following workflow:

```yaml
name: DevShield Security Scan

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run DevShield Assist
        uses: aymannk50/DevShield-Assist@v1
```

The workflow fails when DevShield Assist detects high-risk security findings, helping prevent insecure code from being merged.

## Privacy

DevShield Assist scans your files locally inside Visual Studio Code.

- Your source code is not uploaded to an external server.
- No account or API key is required.
- No project source code is collected by the extension.

## Important notice

DevShield Assist is a lightweight static security scanner. It should be used as an additional security check and not as a replacement for professional security testing, code review, or a complete enterprise security platform.

Some results may require manual review.

## Support and feedback

If you discover a bug or want to request a feature, open an issue:

[GitHub Issues](https://github.com/aymannk50/DevShield-Assist/issues)

Source code:

[DevShield Assist on GitHub](https://github.com/aymannk50/DevShield-Assist)

## About the developer

DevShield Assist was created and developed by **Ayman Naeem**.

- [Developer website](https://ayman.de5.net/index-en.html)
- [Facebook](https://www.facebook.com/websitedesign.site/)
- [GitHub](https://github.com/aymannk50)

## License

DevShield Assist is distributed under the MIT License.

Copyright © 2026 Ayman Naeem.