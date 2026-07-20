# AAMU Local Grounded Advising Assistant

A privacy-conscious course-advising demo that searches official Alabama A&M University undergraduate bulletins entirely in the browser. Academic answers are extractive, version-aware, and linked to the source bulletin page; the assistant abstains when the indexed evidence is insufficient.

## Why this project is different

- **Traceable:** answers include bulletin year, page number, supporting text, and an official AAMU link.
- **Local-only:** no API key, backend, authentication, cloud model, or document upload is required.
- **Measurable:** a curated evaluation and live Reliability page expose accuracy, abstention behavior, corpus coverage, and latency.
- **Predictable:** unsupported questions produce a clear no-answer response instead of a fabricated answer.
- **Defensive:** DegreeWorks files are checked for size, MIME type, and PDF signature before local parsing.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
cd AAMU-GDG-AI-Chatbot-main/AAMU-GDG-AI-Chatbot-main/frontend
npm ci
npm run dev
```

`npm run dev` first extracts and indexes the 2022–2023, 2023–2024, and 2024–2025 PDFs from `Pdfstore`, then starts Vite. Open the URL printed by Vite.

Useful commands:

```powershell
npm run kb:build       # Regenerate the 3-bulletin local index
npm run kb:evaluate    # Run the 18-question retrieval evaluation
npm run test:coverage  # Unit and component tests with coverage
npm run check          # Lint, typecheck, tests, evaluation, and build
```

## Interview demo flow

1. Ask: **“What is the maximum course load in 2024–2025?”**
2. Open the returned page citation and explain that the answer is extracted from local evidence.
3. Ask: **“Compare the attendance policy between 2022–2023 and 2024–2025.”**
4. Ask an unsupported question such as **“What is the quantum submarine maintenance schedule?”** to demonstrate safe abstention.
5. Open **Reliability** to show corpus provenance, evaluation accuracy, latency, local-only processing, and aggregate session metrics.

The current curated evaluation passes 14 of 15 grounded questions (93%), all 3 unsupported questions (100% abstention), and the warm-search P95 target of less than 150 ms. Regenerate `public/data/evaluation-results.json` to refresh measured values on another machine.

## Architecture

```text
Official AAMU PDFs
        |
        v
Build-time page extraction and chunking
        |
        v
Static local JSON index
        |
        v
In-browser BM25-style retrieval
        |
        v
Extractive answer + confidence + page citations
```

The React/Vite frontend remains usable if retrieval fails. Dashboard DegreeWorks parsing and Profile data are separate local-only features. See [Engineering Notes](AAMU-GDG-AI-Chatbot-main/AAMU-GDG-AI-Chatbot-main/docs/ENGINEERING.md) for trust boundaries, failure modes, security decisions, and tradeoffs.

## Limitations

- Retrieval is lexical and extractive; it does not infer facts absent from the source text.
- Only three undergraduate bulletins are indexed.
- Scanned PDFs require OCR and are rejected with a specific message.
- Official citation links require network access only when the user chooses to open them.
- DegreeWorks parsing supports common text layouts and intentionally does not transmit or persist uploaded document contents.
