# Contributing to Vyomix · Earth Query Lens

Thank you for your interest in contributing to **Vyomix · Earth Query Lens**. We welcome contributions from developers, geospatial analysts, data scientists, and UI/UX designers.

This project was engineered for the **Smart India Hackathon (SIH 2026)** by **Shreyas J** ([@SmartKidzee](https://github.com/SmartKidzee)) and the Vyomix Team.

Please review this document to ensure a smooth and effective contribution workflow.

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior through GitHub Private Moderation channels.

---

## Core Architectural Principles

When contributing code, please preserve the following core tenets:

1. **Local-First & Client-Side Privacy:**
   Heavy neural inferences (e.g., EuroSAT classification, NDVI/NDWI/NDBI calculations, Lee radar speckle filtering) execute in-browser via WebAssembly (`onnxruntime-web`) and WebGL. Do not introduce mandatory server-side telemetry or external telemetry trackers.

2. **Deterministic Mathematical Ground Truth:**
   Ground area metrics must be derived using deterministic Ground Sampling Distance (GSD) pixel calculus, not speculative language model guesses.

3. **Responsive & Mobile-Optimized:**
   All visual components (AeroShards, Cesium globe widgets, pill navigation, bento cards, chat interfaces) must render smoothly and responsively across both high-refresh desktop monitors and mobile touch devices.

4. **Clean, Uncluttered UI/UX:**
   Avoid artificial "AI slop" UI patterns (such as nested glowing cards, excessive shadows, or redundant floating avatars). Keep the conversational flow clean, minimalist, and readable (similar to ChatGPT and Claude interfaces).

---

## Development Environment Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` LTS recommended)
- **npm**: `v9.0.0` or higher
- **Git**

### Installation

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/SmartKidzee/vyomixsih.git
   cd vyomixsih
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:5173`.

4. **Verify TypeScript compilation and linting:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## Branching Strategy & Git Workflow

- Always branch off the default `main` branch.
- Use descriptive branch names with conventional prefixes:
  - `feat/feature-name` (e.g., `feat/sar-polarization-filter`)
  - `fix/issue-description` (e.g., `fix/mobile-shard-aspect-ratio`)
  - `perf/optimization` (e.g., `perf/wasm-memory-buffer`)
  - `docs/documentation-update` (e.g., `docs/add-sentinel1-guide`)

### Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Permitted Types:**
- `feat`: A new user-facing capability or pipeline
- `fix`: A bug fix
- `docs`: Documentation updates only
- `style`: Formatting or styling changes that do not alter code logic
- `refactor`: Code reorganization without functional changes
- `perf`: Performance optimizations
- `test`: Adding or updating test suites
- `chore`: Build tooling, dependency, or configuration updates

**Example:**
```bash
git commit -m "feat(radar): add 5x5 lee speckle filter for sentinel-1 amplitude"
```

---

## Pull Request Guidelines

1. **Self-Review:**
   Before opening a PR, review your changes to remove temporary debug logs, console outputs, and unnecessary whitespace changes.

2. **Type Safety & Build Checks:**
   Run `npx tsc --noEmit` and `npm run build` locally to verify that the build completes without errors or warnings.

3. **Mobile & Desktop Verification:**
   Verify responsive behavior across both desktop viewports (1440px+) and mobile screens (375px–420px).

4. **Fill out the Pull Request Template:**
   Complete the checklist provided in [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md).

5. **Attribution Preservation:**
   Ensure license headers and attribution metadata to **Shreyas J** and **The Vyomix Team** remain intact as specified in [LICENSE](../LICENSE).

---

## Reporting Vulnerabilities

Do **not** open public GitHub issues for security vulnerabilities. Please report them confidentially using [GitHub Private Security Advisories](https://github.com/SmartKidzee/vyomixsih/security/advisories) as detailed in [SECURITY.md](../SECURITY.md).
