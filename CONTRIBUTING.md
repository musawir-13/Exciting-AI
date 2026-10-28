# Contributing to Exciting AI

Thank you for your interest in contributing to **Exciting AI**! We welcome community contributions, bug reports, and enhancements.

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x LTS or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- Git (v2.30 or higher)

### Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/musawir-13/Exciting-AI.git
   cd Exciting-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Never commit `.env` containing sensitive credentials!

4. **Launch the backend server:**
   ```bash
   npm start
   # Server runs at http://localhost:2020
   ```

5. **In a separate terminal, launch the desktop client:**
   ```bash
   npm run electron
   ```

---

## Testing & Verification Standards

Exciting AI features an automated master test suite covering 12 distinct verification domains. All pull requests must pass 100% of these tests before merging:

```bash
npm test
```

### Verified Test Domains:
1. Message Pipeline & Anti-Scripted Verification
2. Provider & Model Routing (Ollama Severed)
3. Natural Response Variation & Non-Deterministic Sampling
4. Multi-Turn Conversation Memory & Persistence
5. Poe Models Extraction (1,927 unique models)
6. Comprehensive Identity & About Intelligence
7. Natural Conversation System & Anti-Scripting
8. Chats Default Launch & Apps Removal
9. Company Hub & Model Mappings
10. Enhanced Attachment & File Handling
11. IDeV Knowledge & Model Identity Synchronization
12. Shared Web Research Engine & SSRF Security

---

## Coding Standards

- **Vanilla / Minimal Dependencies:** Maintain lightweight, high-performance logic without unnecessary bloated frameworks.
- **SSRF Defense:** Always validate and sanitize external network destinations in web services.
- **Privacy First:** Never transmit user prompt text or chat files to external analytics servers.
- **Clean Commits:** Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- **Zero Exposed Keys:** Never hardcode API keys or secret tokens into source code or test fixtures.

---

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Commit your changes: `git commit -m 'feat: add description'`
3. Run tests: `npm test`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request against `main`.
