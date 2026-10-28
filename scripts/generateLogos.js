const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'assets', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const logos = {
  openai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.65a4.475 4.475 0 0 1 2.343-1.974V12.2a.795.795 0 0 0 .392.682l5.842 3.37-2.02 1.167a.08.08 0 0 1-.067.01L4.004 14.6A4.504 4.504 0 0 1 2.34 8.65zM18.73 10.99l-5.843-3.37 2.02-1.167a.08.08 0 0 1 .067-.01l4.825 2.783a4.504 4.504 0 0 1-1.069 1.764zm1.93-3.64l-.142-.085-4.783-2.759a.771.771 0 0 0-.78 0L9.112 7.875V5.543a.08.08 0 0 1 .033-.062L14.002 2.7a4.5 4.5 0 0 1 6.658 4.65zm-10.29 4.805l-2.02-1.168a.071.071 0 0 1-.038-.052V5.352a4.504 4.504 0 0 1 7.37-3.454l-.141.08-4.779 2.759a.795.795 0 0 0-.392.681zm1.11 2.37l2.87-1.656 2.87 1.656v3.313l-2.87 1.656-2.87-1.656z" fill="#10a37f"/>
  </svg>`,

  anthropic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#CC785C"/>
    <path d="M13.82 6.5h2.52l4.86 11H18.7l-1.06-2.58h-4.94l-1.06 2.58h-2.5l4.68-11zm2.96 6.46l-1.6-3.86-1.6 3.86h3.2zM7.16 6.5h2.46l-4.8 11H2.36l4.8-11z" fill="#FFFFFF"/>
  </svg>`,

  google: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#1E1E1E"/>
    <path d="M12 4l1.8 5.6 5.6 1.8-5.6 1.8L12 18.8l-1.8-5.6-5.6-1.8 5.6-1.8L12 4z" fill="url(#gemini-grad)"/>
    <defs>
      <linearGradient id="gemini-grad" x1="4.6" y1="4" x2="19.4" y2="18.8" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4E82EE"/>
        <stop offset="0.5" stop-color="#9B72CF"/>
        <stop offset="1" stop-color="#E25565"/>
      </linearGradient>
    </defs>
  </svg>`,

  meta: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#0668E1"/>
    <path d="M16.92 7.5c-1.38 0-2.58.74-3.46 1.83C12.58 8.24 11.38 7.5 10 7.5c-2.45 0-4.5 2.1-4.5 4.7 0 2.65 2.05 4.75 4.5 4.75 1.48 0 2.76-.8 3.56-2.02.8 1.22 2.08 2.02 3.56 2.02 2.45 0 4.5-2.1 4.5-4.75 0-2.6-2.05-4.7-4.5-4.7zm-6.92 7.7c-1.5 0-2.75-1.32-2.75-2.95 0-1.63 1.25-2.95 2.75-2.95 1.34 0 2.45 1.05 2.7 2.45-.48 1.95-1.55 3.45-2.7 3.45zm6.92 0c-1.15 0-2.22-1.5-2.7-3.45.25-1.4 1.36-2.45 2.7-2.45 1.5 0 2.75 1.32 2.75 2.95 0 1.63-1.25 2.95-2.75 2.95z" fill="#FFFFFF"/>
  </svg>`,

  microsoft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022"/>
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00"/>
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF"/>
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900"/>
  </svg>`,

  alibaba: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#FF6A00"/>
    <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1.5 13.5h-3v-2h3v2zm1.8-6.3l-.9.9c-.7.7-1.4 1.4-1.4 2.9h-2c0-1.8.8-2.6 1.6-3.4l1.2-1.2c.4-.4.7-.9.7-1.5 0-1.1-.9-2-2-2s-2 .9-2 2H7.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 .9-.4 1.8-1.2 2.3z" fill="#FFFFFF"/>
  </svg>`,

  mistral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#FF7000"/>
    <rect x="4" y="6" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="16.8" y="6" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="7.2" y="9.2" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="13.6" y="9.2" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="10.4" y="12.4" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="4" y="15.6" width="3.2" height="3.2" fill="#FFFFFF"/>
    <rect x="16.8" y="15.6" width="3.2" height="3.2" fill="#FFFFFF"/>
  </svg>`,

  deepseek: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#0D53FF"/>
    <path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm-1 11.5l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" fill="#FFFFFF"/>
  </svg>`,

  nvidia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path d="M7.8 7.5c2.6-1.5 6.1-1.3 8.5.5 1.5 1.2 2.2 2.8 2.2 4.6 0 1.9-.9 3.6-2.5 4.8-2.5 1.8-6.1 1.7-8.5-.1-.8-.6-1.4-1.4-1.8-2.3l2.8-1.2c.2.5.5 1 .9 1.3 1.3 1 3.3 1 4.7 0 .9-.7 1.4-1.7 1.4-2.7 0-1.1-.6-2.1-1.5-2.8-1.5-.9-3.4-.9-4.8.1-.5.4-.9.9-1.1 1.5L7 11.2c.1-.8.4-1.6.8-2.3z" fill="#76B900"/>
  </svg>`,

  cohere: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#39594D"/>
    <path d="M12 4.5A7.5 7.5 0 0 0 4.5 12 7.5 7.5 0 0 0 12 19.5c2.07 0 3.96-.84 5.3-2.2l-2.1-2.1A4.5 4.5 0 1 1 12 7.5c1.24 0 2.37.5 3.2 1.32l2.12-2.12A7.47 7.47 0 0 0 12 4.5z" fill="#D97757"/>
  </svg>`,

  xai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path d="M18.24 3h2.63l-5.75 6.57L21.87 21h-5.3l-4.15-5.43L7.66 21H5.03l6.15-7.03L4.41 3h5.43l3.75 4.96L18.24 3zm-.92 16.42h1.46L8.85 4.5H7.28l10.04 14.92z" fill="#FFFFFF"/>
  </svg>`,

  zhipu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#2D5BFF"/>
    <circle cx="12" cy="12" r="5" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  moonshot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#181920"/>
    <path d="M12 4a8 8 0 1 0 8 8 6 6 0 0 1-8-8z" fill="#6C63FF"/>
  </svg>`,

  minimax: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#F03838"/>
    <rect x="5" y="11" width="3" height="6" rx="1.5" fill="#FFFFFF"/>
    <rect x="10.5" y="7" width="3" height="10" rx="1.5" fill="#FFFFFF"/>
    <rect x="16" y="9" width="3" height="8" rx="1.5" fill="#FFFFFF"/>
  </svg>`,

  stepfun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#7C3AED"/>
    <path d="M6 18h4v-4h4v-4h4V6" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  ai21: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#1C2D42"/>
    <circle cx="12" cy="12" r="6" fill="#00C4B4"/>
    <path d="M10 9v6m4-6v6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  reka: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#4C1D95"/>
    <polygon points="12,4 20,18 4,18" fill="#F43F5E"/>
  </svg>`,

  upstage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#EA580C"/>
    <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
    <path d="M12 4v2m0 12v2M4 12h2m12 0h2" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  nous: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#0F172A"/>
    <path d="M12 4L4 12l8 8 8-8-8-8zm0 4l4 4-4 4-4-4 4-4z" fill="#38BDF8"/>
  </svg>`,

  databricks: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#FF3621"/>
    <path d="M12 4L3 9l9 5 9-5-9-5zm0 6l-9 5 9 5 9-5-9-5z" fill="#FFFFFF"/>
  </svg>`,

  tii: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#D97706"/>
    <path d="M12 3l7 14-7-3-7 3 7-14z" fill="#FFFFFF"/>
  </svg>`,

  stability: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <circle cx="8" cy="8" r="3" fill="#EC4899"/>
    <circle cx="16" cy="8" r="3" fill="#8B5CF6"/>
    <circle cx="12" cy="16" r="3" fill="#3B82F6"/>
  </svg>`,

  'black-forest-labs': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#052E16"/>
    <path d="M12 4L4 12h16L12 4zm0 8l-6 8h12l-6-8z" fill="#22C55E"/>
  </svg>`,

  midjourney: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#0B132B"/>
    <path d="M4 16c4 0 6-8 10-8s4 8 6 8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  elevenlabs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <rect x="8" y="5" width="3" height="14" rx="1.5" fill="#FFFFFF"/>
    <rect x="13" y="5" width="3" height="14" rx="1.5" fill="#FFFFFF"/>
  </svg>`,

  community: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
    <rect width="24" height="24" rx="5" fill="#0284C7"/>
    <circle cx="12" cy="12" r="7" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M12 5a9.5 9.5 0 0 0 0 14M5 12h14" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`
};

let count = 0;
for (const [id, svg] of Object.entries(logos)) {
  const filePath = path.join(logosDir, `${id}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  count++;
}
console.log(`Successfully generated ${count} vector SVG logos in: ${logosDir}`);
