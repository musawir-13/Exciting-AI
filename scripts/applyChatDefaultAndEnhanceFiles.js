const fs = require('fs');
const path = require('path');

// 1. Restore public/index.html from public/index.html.orig
const origHtmlPath = path.join(__dirname, '..', 'public', 'index.html.orig');
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
if (fs.existsSync(origHtmlPath)) {
  fs.copyFileSync(origHtmlPath, indexHtmlPath);
  console.log('Restored public/index.html from index.html.orig');
}

// 2. Modify public/assets/index--k3l9yqh.js
const jsPath = path.join(__dirname, '..', 'public', 'assets', 'index--k3l9yqh.js');
let js = fs.readFileSync(jsPath, 'utf8');

// A. Remove Apps link from sidebar navigation
const oldSidebar = 'children:[x.jsxs(mc,{to:"/connect",className:t("apps"),draggable:!1,children:[x.jsx(wq,{className:"h-5 w-5 stroke-current"}),x.jsx("span",{className:"truncate",children:"Apps"})]}),x.jsxs(mc,{to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"},className:t("chat")';
const newSidebar = 'children:[x.jsxs(mc,{to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"},className:t("chat")';

if (js.includes(oldSidebar)) {
  js = js.replace(oldSidebar, newSidebar);
  console.log('Successfully removed Apps link from sidebar navigation');
} else {
  console.warn('Sidebar pattern not matched!');
}

// B. Change root route default redirect to Chats (/c/new)
const oldRootRoute = 'settings.OnboardingVersion<Dm)throw cm({to:"/onboarding"});throw cm({to:"/connect"})}});';
const newRootRoute = 'settings.OnboardingVersion<Dm)throw cm({to:"/onboarding"});throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})}});';

if (js.includes(oldRootRoute)) {
  js = js.replace(oldRootRoute, newRootRoute);
  console.log('Successfully set Chats (/c/new) as default route on launch');
} else {
  console.warn('Root route pattern not matched!');
}

// C. Change onboarding completion redirect to Chats (/c/new)
const oldOnboarding1 = 'settings.OnboardingVersion>=Dm){throw cm({to:"/connect"})';
const newOnboarding1 = 'settings.OnboardingVersion>=Dm){throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})';
if (js.includes(oldOnboarding1)) {
  js = js.replace(oldOnboarding1, newOnboarding1);
  console.log('Successfully updated onboarding check redirect');
}

const oldOnboarding2 = 'await e({to:"/connect"})';
const newOnboarding2 = 'await e({to:"/c/$chatId",params:{chatId:"new"}})';
if (js.includes(oldOnboarding2)) {
  js = js.replace(oldOnboarding2, newOnboarding2);
  console.log('Successfully updated onboarding callback redirect');
}

// D. Redirect /connect route to /c/$chatId {chatId:"new"}
const oldConnectRoute = 'const nY=Ef("/connect")({component:rY});';
const newConnectRoute = 'const nY=Ef("/connect")({beforeLoad:()=>{throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})},component:()=>null});';
if (js.includes(oldConnectRoute)) {
  js = js.replace(oldConnectRoute, newConnectRoute);
  console.log('Successfully redirected /connect route to /c/new');
} else {
  console.warn('Connect route pattern not matched!');
}

// E. Enhance file and image support in frontend bundle
// 1. Enhance Lo(e) image check:
const oldLo = 'function Lo(e){const t=e.toLowerCase().split(".").pop();return["png","jpg","jpeg","gif","webp"].includes(t||"")}';
const newLo = 'function Lo(e){const t=e.toLowerCase().split(".").pop();return["png","jpg","jpeg","gif","webp","bmp","svg","ico","avif","tiff"].includes(t||"")}';
if (js.includes(oldLo)) {
  js = js.replace(oldLo, newLo);
  console.log('Successfully enhanced Lo(e) image extensions');
} else {
  console.warn('Lo pattern not matched!');
}

// 2. Enhance Efe allowed image types
const oldEfe = 'Efe=["png","jpg","jpeg","webp"]';
const newEfe = 'Efe=["png","jpg","jpeg","webp","gif","bmp","svg","ico","avif","tiff"]';
if (js.includes(oldEfe)) {
  js = js.replace(oldEfe, newEfe);
  console.log('Successfully enhanced Efe allowed image types');
} else {
  console.warn('Efe pattern not matched!');
}

// 3. Enhance wfe allowed code and document extensions
const oldWfe = 'wfe=["pdf","docx","txt","md","csv","json","xml","html","htm","js","jsx","ts","tsx","py","java","cpp","c","cc","h","cs","php","rb","go","rs","swift","kt","scala","sh","bat","yaml","yml","toml","ini","cfg","conf","log","rtf"]';
const newWfe = 'wfe=["pdf","docx","txt","md","markdown","csv","tsv","json","xml","html","htm","js","jsx","mjs","cjs","ts","tsx","py","java","cpp","c","cc","h","hpp","cs","php","rb","go","rs","swift","kt","scala","sql","sh","bash","bat","cmd","ps1","yaml","yml","toml","ini","cfg","conf","log","rtf","vue","svelte","astro","env","diff","patch"]';
if (js.includes(oldWfe)) {
  js = js.replace(oldWfe, newWfe);
  console.log('Successfully enhanced wfe allowed document/code types');
} else {
  console.warn('wfe pattern not matched!');
}

// 4. Enhance XM image preview generator for all image types and deserialized objects
const oldXM = 'switch(l){case"png":c="image/png";break;case"jpg":case"jpeg":c="image/jpeg";break;case"gif":c="image/gif";break;case"webp":c="image/webp";break}let d;if(e.data instanceof Uint8Array)d=e.data;else if(Array.isArray(e.data))d=new Uint8Array(e.data);else if(typeof e.data=="string"){';
const newXM = 'switch(l){case"png":c="image/png";break;case"jpg":case"jpeg":c="image/jpeg";break;case"gif":c="image/gif";break;case"webp":c="image/webp";break;case"svg":c="image/svg+xml";break;case"bmp":c="image/bmp";break;case"ico":c="image/x-icon";break;case"avif":c="image/avif";break;case"tiff":case"tif":c="image/tiff";break}let d;if(e.data instanceof Uint8Array)d=e.data;else if(Array.isArray(e.data))d=new Uint8Array(e.data);else if(typeof e.data=="object"&&e.data!==null){d=new Uint8Array(Object.values(e.data))}else if(typeof e.data=="string"){';
if (js.includes(oldXM)) {
  js = js.replace(oldXM, newXM);
  console.log('Successfully enhanced XM image preview rendering for SVG/BMP/ICO/AVIF and object formats');
} else {
  console.warn('XM pattern not matched!');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Saved modified public/assets/index--k3l9yqh.js');
