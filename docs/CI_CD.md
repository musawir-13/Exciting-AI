# Exciting AI — Automated CI/CD & GitHub Actions

Exciting AI uses GitHub Actions workflows for continuous integration, multi-platform packaging, and automated GitHub Releases.

---

## 1. Workflows

### Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers**: Pull requests and commits pushed to `main`/`master`.
- **Operating Systems**: `windows-latest`, `ubuntu-latest`.
- **Validation Steps**:
  1. Node.js environment setup.
  2. Dependency installation via `npm install`.
  3. 1,927-model catalogue integrity check.
  4. Execution of the complete automated test suite (`npm test`).
  5. Standalone Web package build verification (`npm run build:web`).
  6. Android mobile staging verification (`npm run build:android`).

### Multi-Platform Release Builder (`.github/workflows/release.yml`)
- **Triggers**: Tag pushes matching `v*` (e.g. `v1.0.0`).
- **Matrix Build Matrix**:
  - **Windows**: Windows Installer (`.exe`), Portable (`.exe`) via `electron-builder`.
  - **macOS**: Apple Silicon (`arm64`) & Intel (`x64`) DMG packages.
  - **Linux**: AppImage, Debian (`.deb`), and RedHat (`.rpm`) packages.
  - **Android**: Android project staging and asset archive.
  - **Web**: Standalone `.tar.gz` bundle for cloud and browser hosting.
- **Integrity**: Calculates SHA-256 checksums for every artifact.
- **Publishing**: Uploads all artifacts and checksum files directly to the versioned GitHub Release.
