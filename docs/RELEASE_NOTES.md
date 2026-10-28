# Exciting AI — Version 1.0.0 Release Notes

**Release Date:** October 28, 2026  
**Developer:** Ubaid  
**Company:** IDeV  
**Repository:** https://github.com/musawir-13/Exciting-AI.git  

---

## What's New in v1.0.0

### 1. Functional Web Access for All 1,927 Models
- Globe-shaped **Web Access** button fully integrated into the chat composer.
- Shared, provider-independent web research engine powered by public search and safe page content extraction.
- Automatic citation generation with clickable Markdown source links.
- Robust SSRF protection, private IP filtering, and prompt injection defense boundaries.
- Models without native tool calling receive synthesized, verified web reference context.

### 2. Multi-Platform Architecture
- **Windows**: Modern installer (`.exe`) and portable standalone edition.
- **macOS**: DMG packages for Apple Silicon (`arm64`) and Intel (`x64`).
- **Linux**: AppImage, Debian (`.deb`), and RedHat (`.rpm`) packages.
- **Android**: Full Android project in `apps/mobile/android` with touch navigation, file pickers, and back-button navigation.
- **Web**: Standalone browser package in `dist/web/` capable of running without Electron on any server or cloud container.

### 3. Verified 1,927-Model Catalogue
- Access to 1,927 frontier, open-source, and specialized models.
- Accurate model identity and provider attribution (OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, Mistral, xAI).
- Dynamic model selection in the UI with zero cross-company restrictions.

### 4. Automated CI/CD & GitHub Releases
- Automated GitHub Actions workflows for continuous integration and multi-platform packaging.
- SHA-256 verification checksums for all release binaries.
