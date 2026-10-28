const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Make a clean backup first if not exists
if (!fs.existsSync(indexPath + '.orig')) {
  fs.writeFileSync(indexPath + '.orig', html, 'utf8');
}

const stylesAndScript = `
    <!-- AI Company Apps Hub & Provider Chat Indicator -->
    <style>
      #company-apps-hub-view {
        padding: 32px 36px;
        max-width: 1360px;
        margin: 0 auto;
        box-sizing: border-box;
        color: #111827;
        font-family: inherit;
      }
      .dark #company-apps-hub-view {
        color: #f9fafb;
      }

      .hub-header {
        margin-bottom: 24px;
      }
      .hub-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 6px;
      }
      .hub-title {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .hub-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
      .dark .hub-subtitle {
        color: #9ca3af;
      }

      .hub-search-bar {
        display: flex;
        align-items: center;
        margin-top: 18px;
        position: relative;
        max-width: 620px;
      }
      .hub-search-input {
        width: 100%;
        padding: 11px 36px 11px 42px;
        font-size: 14px;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        background: #ffffff;
        color: #111827;
        outline: none;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      }
      .dark .hub-search-input {
        background: #1c1c1e;
        border-color: rgba(255, 255, 255, 0.12);
        color: #f9fafb;
      }
      .hub-search-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }
      .hub-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        opacity: 0.45;
        pointer-events: none;
      }
      .hub-search-clear {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        font-size: 16px;
        line-height: 1;
      }

      .hub-meta-info {
        margin-top: 10px;
        font-size: 12px;
        color: #6b7280;
      }
      .dark .hub-meta-info {
        color: #9ca3af;
      }

      /* Grid of Company Cards */
      .company-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 20px;
        padding-bottom: 40px;
      }

      .company-card {
        position: relative;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        padding: 18px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        user-select: none;
      }
      .dark .company-card {
        background: #1c1c1e;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .company-card:hover {
        transform: translateY(-2px);
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      .dark .company-card:hover {
        border-color: rgba(96, 165, 250, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .company-card.active-company {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.02);
        box-shadow: 0 0 0 1.5px #10b981, 0 8px 24px rgba(16, 185, 129, 0.12);
      }
      .dark .company-card.active-company {
        background: rgba(16, 185, 129, 0.05);
        border-color: #10b981;
        box-shadow: 0 0 0 1.5px #10b981, 0 8px 24px rgba(16, 185, 129, 0.2);
      }

      .company-card-top {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 12px;
      }
      .company-logo-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        padding: 7px;
        border: 1px solid rgba(0, 0, 0, 0.04);
      }
      .dark .company-logo-wrap {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.06);
      }
      .company-logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .company-card-title-group {
        flex: 1;
        min-width: 0;
      }
      .company-name {
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 3px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
      }
      .company-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 500;
        color: #10b981;
      }
      .company-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10b981;
        display: inline-block;
        box-shadow: 0 0 6px #10b981;
      }

      .company-desc {
        font-size: 12px;
        line-height: 1.5;
        color: #6b7280;
        margin: 0 0 16px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 36px;
      }
      .dark .company-desc {
        color: #9ca3af;
      }

      .company-card-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
      }
      .dark .company-card-bottom {
        border-top-color: rgba(255, 255, 255, 0.06);
      }

      .model-count-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(99, 102, 241, 0.08);
        color: #6366f1;
      }
      .dark .model-count-badge {
        background: rgba(99, 102, 241, 0.2);
        color: #818cf8;
      }

      .company-action-label {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: color 0.15s ease;
      }
      .company-card:hover .company-action-label {
        color: #3b82f6;
      }
      .active-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        padding: 3px 8px;
        border-radius: 9999px;
      }

      /* Chat Header Indicator */
      .chat-company-pill {
        position: fixed;
        top: 10px;
        right: 18px;
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 9999px;
        padding: 4px 10px 4px 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        font-size: 12px;
        color: #374151;
        transition: all 0.2s ease;
        user-select: none;
      }
      .dark .chat-company-pill {
        background: rgba(28, 28, 30, 0.9);
        border-color: rgba(255, 255, 255, 0.12);
        color: #e5e7eb;
      }
      .chat-company-pill-logo {
        width: 20px;
        height: 20px;
        border-radius: 5px;
        object-fit: contain;
      }
      .chat-company-pill-name {
        font-weight: 600;
      }
      .chat-company-pill-count {
        font-size: 11px;
        color: #6b7280;
      }
      .dark .chat-company-pill-count {
        color: #9ca3af;
      }
      .chat-company-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        font-weight: 600;
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.08);
        border: none;
        border-radius: 9999px;
        padding: 2px 8px;
        margin-left: 4px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .dark .chat-company-pill-btn {
        background: rgba(59, 130, 246, 0.18);
        color: #60a5fa;
      }
      .chat-company-pill-btn:hover {
        background: rgba(59, 130, 246, 0.22);
      }
    </style>

    <script>
      (function() {
        // 1. Initial Launch: Redirect / to /connect if accessed at root
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.history.replaceState(null, '', '/connect');
        }

        let hubCompanies = [];
        let hubActiveCompany = null;
        let hubSearchQuery = '';
        let hubIsLoading = false;
        let hubFetchPromise = null;

        function loadCompaniesData() {
          if (hubFetchPromise) return hubFetchPromise;
          hubIsLoading = true;
          hubFetchPromise = fetch('/api/v1/companies')
            .then(r => r.json())
            .then(data => {
              hubCompanies = data.companies || [];
              hubActiveCompany = data.activeCompany || null;
              hubIsLoading = false;
              hubFetchPromise = null;
              return data;
            })
            .catch(err => {
              console.error('Failed to load companies:', err);
              hubIsLoading = false;
              hubFetchPromise = null;
            });
          return hubFetchPromise;
        }

        async function handleCompanySelect(companyId) {
          try {
            const resp = await fetch('/api/v1/companies/select', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ company: companyId })
            });
            const data = await resp.json();
            if (data.ok && data.activeCompany) {
              hubActiveCompany = data.activeCompany;
              // Transition to chat screen
              window.location.href = '/c/new';
            }
          } catch (e) {
            console.error('Error selecting company:', e);
          }
        }

        function filterCompanies(list, query) {
          const q = (query || '').trim().toLowerCase();
          if (!q) return list;
          return list.filter(c => {
            if (c.name.toLowerCase().includes(q)) return true;
            if (c.shortName && c.shortName.toLowerCase().includes(q)) return true;
            if (c.id && c.id.toLowerCase().includes(q)) return true;
            if (c.desc && c.desc.toLowerCase().includes(q)) return true;
            if (c.modelNames && c.modelNames.some(m => m.includes(q))) return true;
            return false;
          });
        }

        function renderHubUI(container) {
          if (!container) return;
          if (hubCompanies.length === 0) {
            if (!hubIsLoading) {
              loadCompaniesData().then(() => renderHubUI(container));
            }
            container.innerHTML = '<div style="padding:40px;text-align:center;color:#9ca3af;">Loading AI Companies...</div>';
            return;
          }

          const filtered = filterCompanies(hubCompanies, hubSearchQuery);
          const activeId = hubActiveCompany ? hubActiveCompany.id : 'openai';

          let html = \`
            <div class="hub-header">
              <div class="hub-title-row">
                <h1 class="hub-title">
                  <span>AI Company Gallery</span>
                </h1>
              </div>
              <p class="hub-subtitle">
                Select an AI foundation company to explore models and start conversations.
              </p>

              <div class="hub-search-bar">
                <svg class="hub-search-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                </svg>
                <input
                  id="hub-search-input"
                  class="hub-search-input"
                  type="text"
                  placeholder="Search 26 AI companies or models (e.g. DeepSeek, Claude, Llama, Flux, o1, Gemini)..."
                  value="\${escapeHtml(hubSearchQuery)}"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button id="hub-search-clear" class="hub-search-clear" style="display:\${hubSearchQuery ? 'block' : 'none'};" title="Clear search">&times;</button>
              </div>

              <div class="hub-meta-info">
                Showing <strong>\${filtered.length}</strong> of <strong>\${hubCompanies.length}</strong> AI Companies
              </div>
            </div>

            <div class="company-grid">
          \`;

          if (filtered.length === 0) {
            html += \`
              <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: #9ca3af;">
                <p style="font-size: 16px; margin-bottom: 8px;">No companies found matching "<strong>\${escapeHtml(hubSearchQuery)}</strong>"</p>
                <button id="hub-clear-search-btn" style="color: #3b82f6; font-size: 13px; font-weight: 500; background: none; border: none; cursor: pointer;">Clear search filter</button>
              </div>
            \`;
          } else {
            filtered.forEach(c => {
              const isActive = (c.id === activeId);
              html += \`
                <div class="company-card \${isActive ? 'active-company' : ''}" data-company-id="\${c.id}">
                  <div>
                    <div class="company-card-top">
                      <div class="company-logo-wrap">
                        <img class="company-logo-img" src="\${c.logo}" alt="\${c.name}" onerror="this.onerror=null; this.src='/favicon.png';" />
                      </div>
                      <div class="company-card-title-group">
                        <h3 class="company-name">\${escapeHtml(c.name)}</h3>
                        <div class="company-status-badge">
                          <span class="company-status-dot"></span>
                          <span>\${c.status || 'Active'}</span>
                        </div>
                      </div>
                    </div>
                    <p class="company-desc">\${escapeHtml(c.desc)}</p>
                  </div>

                  <div class="company-card-bottom">
                    <span class="model-count-badge">\${c.modelCount} models</span>
                    \${isActive ? \`
                      <span class="active-badge-pill">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                        </svg>
                        Active Provider
                      </span>
                    \` : \`
                      <span class="company-action-label">
                        Select
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    \`}
                  </div>
                </div>
              \`;
            });
          }

          html += \`</div>\`;
          container.innerHTML = html;

          // Wire events
          const searchInput = container.querySelector('#hub-search-input');
          const searchClear = container.querySelector('#hub-search-clear');
          const clearBtn = container.querySelector('#hub-clear-search-btn');

          if (searchInput) {
            searchInput.focus();
            // Restore cursor position at end
            const len = searchInput.value.length;
            searchInput.setSelectionRange(len, len);

            searchInput.addEventListener('input', (e) => {
              hubSearchQuery = e.target.value;
              renderHubUI(container);
            });
          }

          if (searchClear) {
            searchClear.addEventListener('click', () => {
              hubSearchQuery = '';
              renderHubUI(container);
            });
          }

          if (clearBtn) {
            clearBtn.addEventListener('click', () => {
              hubSearchQuery = '';
              renderHubUI(container);
            });
          }

          const cards = container.querySelectorAll('.company-card');
          cards.forEach(card => {
            card.addEventListener('click', () => {
              const cid = card.getAttribute('data-company-id');
              if (cid) handleCompanySelect(cid);
            });
          });
        }

        function escapeHtml(str) {
          if (!str) return '';
          return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function updateChatHeaderPill() {
          const isChat = window.location.pathname.startsWith('/c/');
          let pill = document.getElementById('chat-company-indicator-pill');

          if (!isChat) {
            if (pill) pill.remove();
            return;
          }

          if (!hubActiveCompany) {
            loadCompaniesData().then(() => updateChatHeaderPill());
            return;
          }

          if (!pill) {
            pill = document.createElement('div');
            pill.id = 'chat-company-indicator-pill';
            pill.className = 'chat-company-pill';
            document.body.appendChild(pill);
          }

          pill.innerHTML = \`
            <img class="chat-company-pill-logo" src="\${hubActiveCompany.logo}" alt="\${hubActiveCompany.name}" onerror="this.onerror=null; this.src='/favicon.png';" />
            <span class="chat-company-pill-name">\${escapeHtml(hubActiveCompany.name)}</span>
            <span class="chat-company-pill-count">(\${hubActiveCompany.modelCount || 0} models)</span>
            <button class="chat-company-pill-btn" id="btn-switch-company" title="Switch AI Company">
              Switch
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5a.75.75 0 001.5 0v-2.5a.75.75 0 01.75-.75h11.5a.75.75 0 01.75.75v2.5a.75.75 0 001.5 0v-2.5A2.25 2.25 0 0015.75 2H4.25zm0 16a2.25 2.25 0 01-2.25-2.25v-2.5a.75.75 0 011.5 0v2.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-2.5a.75.75 0 011.5 0v2.5A2.25 2.25 0 0115.75 18H4.25z" clip-rule="evenodd" />
              </svg>
            </button>
          \`;

          const switchBtn = pill.querySelector('#btn-switch-company');
          if (switchBtn) {
            switchBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              window.location.href = '/connect';
            });
          }
        }

        function checkAndSyncView() {
          const hubContainer = document.getElementById('company-apps-hub-view');
          if (hubContainer && (!hubContainer.getAttribute('data-rendered') || hubContainer.children.length === 0)) {
            hubContainer.setAttribute('data-rendered', 'true');
            renderHubUI(hubContainer);
          }
          updateChatHeaderPill();
        }

        // Intercept client side routing
        const originalPushState = history.pushState;
        history.pushState = function() {
          originalPushState.apply(this, arguments);
          setTimeout(checkAndSyncView, 50);
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
          originalReplaceState.apply(this, arguments);
          setTimeout(checkAndSyncView, 50);
        };

        window.addEventListener('popstate', () => {
          setTimeout(checkAndSyncView, 50);
        });

        // Periodic sync to catch React route and DOM mounts
        setInterval(checkAndSyncView, 300);

        // Run immediately on DOM ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            loadCompaniesData().then(checkAndSyncView);
          });
        } else {
          loadCompaniesData().then(checkAndSyncView);
        }
      })();
    </script>
`;

// Insert before </head>
html = html.replace('</head>', stylesAndScript + '\n  </head>');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully patched public/index.html with Company Hub and Chat Indicator.');
