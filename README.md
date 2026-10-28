# Exciting AI ⚡

**Exciting AI** is an autonomous, multi-platform AI desktop workspace and intelligent research companion developed by **IDeV**, created by developer **Ubaid**.

Exciting AI unites access to **1,927 AI models** with a shared, provider-independent **Web Research Engine**, local file session persistence, and zero vendor lock-in.

---

## 🌟 Key Highlights

- **1,927 Models in One Workspace**: Instant access to frontier AI models from OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, Mistral, xAI, Alibaba, and more.
- **Provider-Independent Web Access**: The globe-shaped Web Access button enables real-time public internet search, readable page extraction, and clickable Markdown source citations for *every* supported model.
- **Multi-Platform Support**: Built for Windows, macOS (Apple Silicon & Intel), Linux (AppImage, DEB, RPM), Android phones/tablets, and Web browsers.
- **Local-First & Private**: Chat history, sessions, and configurations are stored directly on your computer in clean local JSON files.
- **No API Key Required**: 100% functional free tier inference out-of-the-box, with optional support for custom API keys and direct cloud endpoints.
- **Safe & Sandboxed**: Comprehensive SSRF protection, prompt injection defense, private network blocking, and safe Markdown rendering.

---

## 🌍 Shared Web Research Engine

Click the globe-shaped **Web Access** button next to the input box in the chat composer:

1. **Active State**: The button highlights blue, activating real-time public research.
2. **Search & Retrieval**: Public web sources are queried, ranked, and sanitized.
3. **Model Grounding**: Research findings are provided to whichever model you have selected (GPT, Claude, Gemini, Llama, DeepSeek, etc.).
4. **Clickable Citations**: Responses automatically include clickable Markdown links (`[Title](URL)`) to the verified web pages.
5. **Inactive State**: Turn off Web Access to resume standard context-only chat without external network requests.

For technical documentation, see [`docs/WEB_RESEARCH.md`](docs/WEB_RESEARCH.md).

---

## 🖥️ Platform Support & Downloads

| Platform | Format | How to Run / Build |
|---|---|---|
| **Windows 10/11** | Installer (`.exe`), Portable (`.exe`) | `npm run pack:win` |
| **macOS** | Apple Silicon & Intel (`.dmg`) | `npm run pack:mac` |
| **Linux** | AppImage, DEB, RPM | `npm run pack:linux` |
| **Android** | Native APK, Android Studio Project | `npm run build:android` |
| **Web Browser** | Standalone Browser Application | `npm run start:web` |

Detailed packaging details are documented in [`docs/PLATFORMS.md`](docs/PLATFORMS.md).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- npm 9+ installed

### Development Setup
```bash
# Clone the repository
git clone https://github.com/musawir-13/Exciting-AI.git
cd Exciting-AI

# Install dependencies
npm install

# Start the application server (http://localhost:2020)
npm start

# In a separate terminal, launch the desktop client
npm run electron
```

### Standalone Web Version
To run Exciting AI strictly in your web browser:
```bash
npm run start:web
# Open http://localhost:2020 in any web browser
```

---

## 🧪 Automated Testing

Exciting AI features an automated master test suite covering 12 distinct verification suites:

```bash
npm test
```

### Test Suites Included:
1. Message Pipeline & Anti-Scripted Verification
2. Provider & Model Routing (Ollama Independence)
3. Natural Response Variation & Non-Deterministic Sampling
4. Multi-Turn Conversation Memory & Persistence
5. Poe & Cloud Models Extraction (1,927 unique entries)
6. Comprehensive Model Identity & About Intelligence
7. Natural Conversational Tone & Emoji Modulation
8. Anti-Repetition Multi-Turn Depth Engine
9. AI Company Registry Mappings
10. Enhanced Attachment & Default Chats Launch
11. IDeV Company Knowledge & Selected Model Sync
12. Shared Web Research Engine & SSRF Security

---

## 🛡️ Security

- **SSRF Defense**: Internal network ranges (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`) and non-HTTP protocols are blocked from web research.
- **Untrusted Content Boundaries**: Retrieved web contents are wrapped as untrusted reference material to prevent prompt injection.
- **Electron Security**: Preload context isolation, IPC input sanitization, and disabled remote modules.

---

## 👨‍💻 Developer & Official Links

- **Developer**: Ubaid
- **Company**: IDeV
- **Product**: Exciting AI
- **GitHub**: [https://github.com/musawir-13](https://github.com/musawir-13)
- **Instagram**: [https://www.instagram.com/musawir___13/](https://www.instagram.com/musawir___13/)
- **Repository**: [https://github.com/musawir-13/Exciting-AI.git](https://github.com/musawir-13/Exciting-AI.git)

---

## 📄 License

Copyright © 2026 IDeV. All rights reserved.
