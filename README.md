# Rature

**Redact sensitive information from PDFs, entirely in your browser.**

Rature is a privacy-first PDF anonymisation tool powered by on-device AI. Drop in a document, let the NER model detect names, dates, organisations, and other personal data, then export a clean redacted copy. Nothing ever leaves your machine.

Built for corporate lawyers, legal experts, DPOs, and compliance professionals who need to share documents without exposing sensitive information.

---

## Features

- **100% local processing**: no uploads & no server
- **AI-powered entity detection** via HuggingFace Transformers.js (WASM for now, WebGPU coming soon)
- **Multiple NER models** including CamemBERT NER PII (optimised for French documents) and multilingual BERT variants
- **Detects:** persons, organisations, dates, locations, emails, phone numbers, IDs, URLs, IP addresses, social security numbers, and more
- **Interactive review**: toggle, delete or manually add entities before exporting
- **Export options**
    - redact in place: big black rectangles are added over sensitive information and the underlying words are wiped out
    - pseudonymise (coming soon): replace all detected entities by random equivalents (e.g. a person's full name will be replaced by `John Doe`)
    - strip metadata: remove all metadata from the document (prevents identifying documents with metadata)
    - document name: rename the document for even better privacy

---

## How it works

1. **Upload**: drag and drop a PDF onto the home screen
2. **Detect**: the NER model runs locally and highlights every detected entity in the document
3. **Review & export**: confirm or adjust detections in the sidebar then download your redacted PDF

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or later (used as runtime, package manager, and script runner)
- A modern browser with WASM support
- (Coming soon) A browser with WebGPU support (Chrome 113+, Edge 113+) for GPU-accelerated inference (falls back to WASM)

### Install and run

```bash
git clone https://github.com/alphabeat/rature
cd rature
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
bun run build    # type-check then bundle for production
bun run preview  # preview the production build locally
bun run lint     # run ESLint
```

---

## Contributing

Contributions are welcome. Here is the usual flow:

1. Fork the repository and create a branch from `main`.
2. Make your changes. Keep commits focused and descriptive.
3. Run `bun run lint` and `bun run build` to make sure everything passes.
4. Open a pull request with a clear description of what you changed and why.

If you have a larger idea (new feature, architecture change), open an issue first so we can discuss it before you invest the time.

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite + SWC (via Bun) |
| Styling | Tailwind CSS v4 |
| PDF engine | MuPDF (WASM) |
| NER / AI | HuggingFace Transformers.js |
| UI primitives | Radix UI, Lucide, Sonner |

---

## License

MIT
