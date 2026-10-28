# Exciting AI — Multi-Platform Architecture & Support Matrix

Exciting AI is designed as a unified, multi-platform AI workspace built on shared core logic, a verified 1,927-model catalogue, and a provider-independent web research system.

---

## 1. Supported Platform Matrix

| Platform | Architecture | Deliverable Format | Build Command | Status |
|---|---|---|---|---|
| **Windows** | x64, ARM64 | NSIS Installer (`.exe`), Portable (`.exe`) | `npm run pack:win` | Verified & Built |
| **macOS** | Apple Silicon (arm64), Intel (x64) | Apple Disk Image (`.dmg`), Archive (`.zip`) | `npm run pack:mac` | Configured in CI/CD |
| **Linux** | x86_64, ARM64 | AppImage, DEB (`.deb`), RPM (`.rpm`) | `npm run pack:linux` | Configured in CI/CD |
| **Android** | ARM64, x86_64 | Native APK (`.apk`), Bundle (`.aab`) | `npm run build:android` | Project Staged |
| **Web** | Any standard browser | Standalone Production Package | `npm run build:web` | Verified & Built |

---

## 2. Architecture Overview

Exciting AI separates core business logic from platform presentation:

```
┌──────────────────────────────────────────────────────────────────┐
│                         Presentation                             │
│   Desktop (Electron)   │   Mobile (Android WebView)   │   Web    │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│                   Shared Engine & Core Logic                     │
│  - 1,927-Model Registry & Catalogue (Storage/models/catalog.json)│
│  - Shared Web Research Engine (engine/webResearch.js)            │
│  - Multi-Turn Conversation Manager (engine/conversationManager.js)│
│  - Provider-Independent Router (engine/inferenceRouter.js)       │
│  - Verified Identity Engine (engine/identity.js)                 │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│                   Local File & Cache Persistence                 │
│  - JSON Session Store                                            │
│  - Zero Cloud Vendor Lock-in                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Platform Build Guides

### Windows (Desktop)
```bash
# Build NSIS Installer and Portable Executable
npm run pack:win
npm run pack:win:portable
# Output located in release/
```

### macOS (Desktop)
```bash
# Build DMG for Apple Silicon and Intel
npm run pack:mac
# Output located in release/
```

### Linux (Desktop)
```bash
# Build AppImage, DEB, and RPM
npm run pack:linux
# Output located in release/
```

### Web Edition (Standalone Browser)
```bash
# Build standalone web package
npm run build:web
# Start standalone web server on port 2020
npm run start:web
```

### Android Mobile
```bash
# Synchronize web assets and stage Android project
npm run build:android
# Open apps/mobile/android in Android Studio or run gradle build:
cd apps/mobile/android
./gradlew assembleRelease
```
