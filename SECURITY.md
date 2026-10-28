# Security Policy — Exciting AI

## Reporting a Vulnerability

The IDeV team takes application and data security seriously. If you discover a vulnerability or security defect in Exciting AI, please report it responsibly:

1. **Private Advisory:** Open a private security advisory at [https://github.com/musawir-13/Exciting-AI/security/advisories](https://github.com/musawir-13/Exciting-AI/security/advisories).
2. **Details:** Include detailed reproduction steps, the affected platform/version (Windows, macOS, Linux, Android, or Web), and potential impact.
3. **Response Time:** We aim to acknowledge receipt within 48 hours and provide remediation updates.

Do not submit vulnerability reports via public issue trackers.

---

## Supported Versions

| Version | Status |
| :--- | :--- |
| **1.0.0** | :white_check_mark: Active & Supported |
| < 1.0.0 | :x: Out of support |

---

## Security Architecture & Defenses

### 1. SSRF & Private Network Interception
- The shared Web Research Engine strictly defends against Server-Side Request Forgery (SSRF).
- Internal loopback (`127.0.0.1`, `localhost`, `::1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local addresses (`169.254.169.254`), and non-HTTP protocols (`file://`, `ftp://`, `gopher://`) are blocked before network connections are dispatched.

### 2. Prompt Injection Isolation
- Web research findings retrieved from third-party websites are framed inside non-executable, untrusted reference context boundaries.
- The model treats retrieved web content strictly as external citation data, preventing injected prompt instructions from hijacking assistant directives.

### 3. Local-First User Data Sandboxing
- Conversation sessions and user settings are persisted strictly on your local disk in `Storage/chats/`.
- Zero user chats, telemetry beacons, or code snippets are transmitted to external analytics servers.

### 4. Credential Protection
- Real API tokens or secrets are never embedded into source code or compiled distribution packages.
- Error dialogs and runtime logs sanitize and redact tokens before output.

### 5. Electron Hardening
- Context isolation is enabled on all native windows.
- Preload script boundaries restrict frontend access to approved IPC channels.
