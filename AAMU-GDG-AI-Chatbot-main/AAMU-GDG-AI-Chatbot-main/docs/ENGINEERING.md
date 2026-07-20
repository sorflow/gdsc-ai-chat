# Engineering Notes

## Design objective

The assistant is a decision-support demonstration, not a general-purpose chatbot. Its primary invariant is that every academic claim is traceable to an indexed AAMU bulletin page. If retrieval cannot support at least half of the meaningful query terms, the system abstains.

## Data flow and interfaces

1. `scripts/build-knowledge-base.mjs` reads the three selected PDFs during development or production builds.
2. PDF.js extracts each page independently. Text is normalized and chunked to approximately 900 characters with 120-character overlap.
3. The generated index preserves academic year, PDF page, deterministic source ID, text, and official source URL.
4. The browser lazily loads the index on the first academic query and prepares token frequencies in memory.
5. Retrieval applies BM25-style scoring, phrase and term-coverage boosts, and explicit-year filtering.
6. The response uses the strongest source sentences and exposes up to three citations. No question text is written to disk or local storage.

The chat reports confidence, years searched, and measured retrieval latency. The Reliability page reads only generated corpus/evaluation metadata and aggregate in-memory session counters.

## Trust boundaries

| Boundary | Data crossing it | Control |
| --- | --- | --- |
| Repository to build process | Known bulletin PDFs | Fixed allowlist of three filenames; build fails on missing or empty documents |
| Static application to browser memory | Generated text index | Same-origin asset; no executable content is evaluated |
| User to local PDF parser | DegreeWorks file | 15 MB limit, exact PDF MIME requirement, `%PDF-` signature validation |
| Browser to external network | Official citation selected by user | No automatic external requests; links open with `noopener noreferrer` |

## Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| Unsupported or misleading answer | Minimum 50% meaningful-term coverage, explicit abstention, visible source excerpts |
| Stale-policy ambiguity | Latest bulletin is the default; explicit years are honored and displayed |
| Prompt injection in source documents | Source text is treated as inert text; there is no model or instruction execution |
| Malicious or forged upload | Size, MIME, magic-byte, parsing, encrypted-file, and no-text checks |
| Leakage of academic records | Parsing stays in browser memory; source text and student identifiers are not logged |
| Hidden quality regression | Versioned evaluation fixture, unit tests, CI, and visible accuracy/latency evidence |
| Dependency compromise | Lockfile installation, production audit in CI, and minimal runtime dependency set |

## Failure modes

- A missing or unsearchable bulletin fails index generation with its exact filename.
- A knowledge-index fetch failure produces a recoverable chat error; other pages remain operational.
- A low-coverage query returns no citations and a narrowing suggestion.
- Oversized, forged, encrypted, corrupt, scanned, and irrelevant DegreeWorks documents receive distinct messages.
- Clearing chat invalidates an in-flight response so stale results cannot reappear.

## Tradeoffs

- Lexical retrieval is less fluent than a generative model but is deterministic, inspectable, fast, offline-capable, and has no credential or data-exfiltration path.
- A three-year corpus favors demo speed and current-policy relevance over historical breadth.
- Build-time extraction increases the build by several seconds but keeps PDF processing out of the interactive search path.
- Evaluation checks retrieval provenance and expected source terms; it does not claim human-equivalent answer quality.
