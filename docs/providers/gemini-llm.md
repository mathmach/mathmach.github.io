# 🧠 Google Gemini Cognitive Engine

All text planning, screenplay generation, multimodal visual audits, and semantic embeddings in Wind Comic are powered natively by **Google Gemini**.

---

## 1. Environment Configuration

Configure credentials in `apps/web/.env.local`:

```bash
# Mandatory Gemini API Key
GEMINI_API_KEY=AIzaSy...

# Optional Base URL override (defaults to official Google endpoint)
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Primary Model for Reasoning, Planning & Vision Audits
GEMINI_MODEL=gemini-2.5-flash

# Embeddings Model for Semantic Search & Style Matching
GEMINI_EMBED_MODEL=gemini-embedding-001

# Rate Limiting Protection (Requests Per Minute)
LLM_MAX_RPM=60
```

Restart development with `bun run dev`.

---

## 2. Model Roles & Specialization

| Purpose                             | Default Model          | Description                                                                                       |
| :---------------------------------- | :--------------------- | :------------------------------------------------------------------------------------------------ |
| **Director & Writer Planning**      | `gemini-2.5-flash`     | Fast generation of structured three-act screenplays and direct-response UGC copy.                 |
| **Vision & Cameo Continuity Audit** | `gemini-2.5-flash`     | Multimodal analysis verifying character identity, wardrobe consistency, and safe-area compliance. |
| **Style & Concept Embeddings**      | `gemini-embedding-001` | High-dimensional latent vectors for style reference retrieval and character matching.             |

---

## 3. Architecture: How LLM Calls Flow

The unified LLM client lives in `apps/web/lib/llm-client.ts` and `apps/web/lib/llm-providers/gemini.ts`:

- **Native REST Invocation:** Directly calls Google Gemini REST endpoints (`v1beta/models/{model}:generateContent` and `v1beta/models/{model}:streamGenerateContent`).
- **Structured Output Contracts:** Enforces strict JSON extraction with Zod schemas.
- **Multimodal Data Parts:** Passes image references (storyboard sketches, turnaround sheets) inline as Base64/JPEG data parts.
- **Dynamic Database Overrides:** At runtime, `model_overrides` table entries allow live swapping of models for specific tasks without restarting the application.
