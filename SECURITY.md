# Security Policy

Vyomix Earth Query Lens is maintained by Shreyas J ([@SmartKidzee](https://github.com/SmartKidzee)) and the Vyomix Core Development Team. We are committed to ensuring the integrity, confidentiality, and resilience of our remote sensing and satellite analytics infrastructure.

---

## Supported Versions

Security updates and critical dependency patches are provided for the following release branches:

| Version | Status | Security Maintenance |
| :--- | :--- | :--- |
| 2.0.x (Current / SIH 2026) | Supported | Active continuous vulnerability patching and dependency auditing |
| 1.0.x | Limited | Critical security vulnerabilities only |
| < 1.0.0 | Unsupported | End of Life (EOL) - Users must upgrade to 2.0.x |

---

## Vulnerability Disclosure Protocol

If you discover a potential vulnerability, sensitive information disclosure, or security defect in Vyomix, please report it through our responsible disclosure process.

### Reporting Procedure

1. **Confidential Reporting Channel:** Submit a confidential report via [GitHub Private Security Advisories](https://github.com/SmartKidzee/vyomixsih/security/advisories/new).
2. **Report Contents:** To assist in rapid triage, please include:
   - Description of the vulnerability and affected components or routes.
   - Proof-of-concept steps or minimal reproduction script.
   - Potential impact assessment (e.g., local storage exposure, denial of service).
   - Any proposed remediation or mitigation steps.

> **Important:** Do not file public GitHub issues, pull requests, or public discussions for unpatched security vulnerabilities. Coordinated disclosure protects researchers, defense personnel, and disaster response teams who utilize this software.

---

## Response Targets and Service Level Agreements

All valid reports are handled through the following milestones:

| Phase | Target Timeline | Deliverable |
| :--- | :--- | :--- |
| Initial Assessment | Within 24 hours | Acknowledgment of receipt and preliminary classification |
| Technical Triage | Within 48 hours | Reproduction, root cause analysis, and severity rating (CVSS) |
| Remediation Development | Within 72 to 120 hours | Staged patch creation, regression testing, and verification |
| Public Release | Coordinated date | Release of patched version, release notes, and researcher credit |

---

## Security Architecture and Threat Model

Vyomix is built around a local-first, zero-retention processing architecture designed to handle high-resolution Earth observation imagery:

### 1. In-Browser Client-Side Computation
- Deep learning tensor inference via ONNX Runtime Web operates within browser WebAssembly SIMD and WebGL sandboxes.
- Radiometric corrections, adaptive Lee speckle filtering, and spectral band computations occur in local browser memory.
- Satellite raster datasets (GeoTIFF, Sentinel products) are not transmitted to intermediate backend relays unless explicitly directed by the operator.

### 2. Ephemeral Storage Isolation
- Session context, conversation history, and uploaded imagery reside exclusively within the operator's browser session and sandboxed IndexedDB storage.
- No telemetry, analytics pixels, or query profiling data is harvested or transmitted to external metrics brokers.

### 3. API Key and Secret Management
- External API tokens (e.g., Gemini Vision credentials, custom inference endpoints, translation keys) are stored strictly within the origin's isolated `localStorage`.
- Credentials are communicated directly to authorized endpoints over TLS 1.3 and are never proxied through third-party servers.

### 4. Forensic Document Integrity
- Generated analytical dossiers incorporate deterministic SHA-256 cryptographic audit seals (`VYX-SHA256-...`).
- The audit hash binds the session identifier and timestamp to enable independent verification against tampering.

---

## Deployment Security Checklist

For government, research, and high-assurance deployments:

1. **Network Isolation:** In air-gapped environments, host all static dependencies, ONNX model binaries, and basemap tile servers on internal network nodes.
2. **Content Security Policy (CSP):** Enforce strict CSP headers restricting `connect-src` only to authorized satellite data providers and specified neural backend endpoints.
3. **Session Purging:** Use the built-in session reset mechanisms to purge IndexedDB storage and browser canvas memory upon conclusion of sensitive monitoring operations.

---

## Researcher Attribution

We acknowledge and credit security researchers who adhere to coordinated vulnerability disclosure. Confirmed contributions will be cited in release documentation with the researcher's preferred handle or attribution.
