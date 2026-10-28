# Changelog — Exciting AI

All notable changes to **Exciting AI** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-28

### Added
- **1,927 Model Universal Catalogue:** Complete model extraction and registry system supporting 1,927 frontier models from OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, xAI, Mistral, Alibaba, and open-source communities.
- **Shared Provider-Independent Web Research Engine:** Universal real-time web access controlled by the globe-shaped composer toggle. Features automated search query synthesis, public source retrieval, readable text extraction, SSRF security validation, and clickable Markdown source citations for *every* model family.
- **Default Chats Screen & UI Streamlining:** Immediate launch to clean conversation workspace (`/c/new`), removed obsolete apps section, enhanced layout responsiveness, and full model family switcher.
- **Enhanced Multi-Format File & Image Processing:** Native handling for images (PNG, JPG, WEBP, GIF, SVG, BMP, ICO) and code attachments (TypeScript, Python, JavaScript, JSON, Markdown).
- **IDeV Company Knowledge & Dynamic Model Identity:** Intelligent dynamic identity injection ensuring models accurately identify their provider, architecture, and verified relationship to IDeV and developer Ubaid.
- **Multi-Platform Release Automation:** Automated packaging scripts and GitHub Actions workflows for Windows (NSIS Installer & Portable), macOS (.dmg), Linux (.AppImage, .deb, .rpm), Android Studio project & APK, and Standalone Web Edition.
- **Automated Master Test Suite:** Comprehensive 12-suite automated test engine (`npm test`) validating model routing, memory persistence, identity accuracy, web access, and SSRF security.

### Security
- **SSRF Defense:** Strict blocking of loopback (`127.0.0.1`), RFC 1918 private subnets, link-local metadata IP (`169.254.169.254`), and non-HTTP protocols.
- **Untrusted Web Content Framing:** Isolated reference blocks to protect against prompt injection from third-party web content.
- **Electron Isolation:** Context isolation, sandboxed preload IPC, and disabled remote modules.
