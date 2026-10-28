# Exciting AI — Provider-Independent Web Research Engine

The Exciting AI Web Research Engine provides genuine, real-time public internet search, verification, and citation capabilities for all **1,927 supported models** in the catalogue.

---

## 1. How It Works

1. **User Action**: The user toggles the globe-shaped **Web Access** button in the chat composer.
2. **Payload Sync**: The client sends `web_search: true` with the chat message.
3. **Query Formulation**: The backend engine extracts clean search queries from the user request.
4. **Public Web Search**: The engine queries public search services (DuckDuckGo HTML & Instant Answers) to find relevant, authoritative results without requiring third-party API keys or external fees.
5. **Safe Page Retrieval**: The top 2-3 most relevant pages are retrieved concurrently with strict security boundaries.
6. **Text & Date Extraction**: HTML markup, scripts, and navigational boilerplate are stripped, extracting readable article text and publication timestamps.
7. **Model Prompt Augmentation**: The verified external evidence is injected as isolated reference context into the model's inference request.
8. **Clickable Citations**: Clickable Markdown source links (`[Title](URL)`) are embedded in the final answer.

---

## 2. Security & Safety Boundaries

- **SSRF Defense**: Strict destination IP validation. Loopback addresses (`127.0.0.0/8`, `localhost`), link-local metadata endpoints (`169.254.169.254`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and non-HTTP protocols (`file:`, `gopher:`, `ftp:`) are strictly blocked before connection.
- **Prompt Injection Isolation**: Web content is clearly isolated inside `[EXTERNAL WEB RESEARCH CONTEXT - UNTRUSTED REFERENCE MATERIAL]`. The model is instructed to treat external text strictly as factual reference data and never execute instructions found inside retrieved pages.
- **Resource Limits**: Requests timeout after 8 seconds; maximum page download size is capped at 50KB to protect system memory.
- **Zero Hallucinated Links**: Citations link only to pages actually visited during the research step.

---

## 3. Dedicated REST Endpoints

- `POST /api/web_search`: Search public web with `{ "query": "..." }`.
- `POST /api/web_fetch`: Fetch readable sanitized page text with `{ "url": "https://..." }`.
