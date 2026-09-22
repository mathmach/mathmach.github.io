# Stage 19 · AI pull-sheet replication (v11.1.x) ✅ fully delivered (v11.1.0–v11.1.3)

> Input: the OiiOii 2.0 review article (2026-06, WeChat account "Luren Jia") + screenshots of its
> pull-sheet analysis UI.
> Conclusion first: of OiiOii 2.0's three new features, "smart canvas" (seven agents in relay + stepwise
> confirmation) ≈ this project's existing 8-agent pipeline + per-stage asset confirmation, and the
> "Skill library" ≈ the existing 18 story templates + the template marketplace.
> **The only real capability gap is "pull-sheet replication"**: upload a video → break it down shot by
> shot into a structured sheet → swap the subjects → generate a replica.
> That is exactly the high-frequency need of traffic-driven creators (as measured in the article:
> "post-apocalyptic boss-beating with everyone swapped for cats", "socialite makeup swapped for bare
> face").

---

## 1. Breaking down the benchmark: what OiiOii's "pull-sheet replication" actually is

A three-step loop (from the article's hands-on):

1. **Pull sheet (breakdown)**: upload a video → it is automatically broken into a five-column structured
   table, shot by shot:
   narrative elements (scene / characters / dialogue) · time (duration / in and out, to the millisecond)
   · camera language (shot size / composition / shot type / camera movement / focal length and depth of
   field) · image treatment (light and colour / edit events / digital grain) · sound (music and SFX /
   the shot's function in the storyboard / the shot's narrative function), each shot with a playable
   thumbnail.
2. **Replace**: the user just says what to swap — characters / scenes / props / wardrobe / logos, all
   swappable, by text instruction or reference image (uploaded or from the in-app assets). The agent
   rewrites the per-shot prompts automatically, **in bulk**, with no shot-by-shot tweaking. Every prompt
   stays fully editable, and storyboard reference images are matched automatically. More images means
   longer parsing (expectation management for the user).
3. **Replicate**: following the original's shot structure with the replaced prompts, generate every shot
   **in parallel** → compose the new film. Fidelity spans plot, image, camera language, UI layout,
   colour and lighting, dialogue and SFX.

The real value the article identifies: the up-front analysis and rewriting workflow of "study and
replicate a hit" gets compressed away; and as a by-product, the automatically generated prompts are
themselves high quality and can be used as study material.

## 2. Our unique advantages (the design follows from these)

1. **Factory-parameter advantage**: a competitor pulling a sheet from its own output has to "guess the
   parameters from the image with AI"; this project already holds every real parameter at generation
   time — the `ScriptShot` v2.8 cinematography fields (shotSize / lens / cameraAngle / cameraMovement /
   lightingIntent / composition / editPattern / diegeticSound / scoreMood / rhythmicSync /
   whyThisChoice) plus duration/dialogue/emotion, which map almost one-to-one onto the five columns. For
   our own projects the pull sheet is **ground truth**, at zero generation cost.
2. **The replication pipeline is free**: pouring the replaced per-shot prompts back into our own pipeline
   is all it takes — the script adaptation path (parsedScript, skipping the creative stage) is a
   ready-made injection point, and parallel generation (PIPELINE_QUEUE), per-shot regeneration
   (rerun/regenerate-shot), reference-image consistency (cref/sref) and composition (video-composer) all
   already exist.
3. **A loop that's useful the moment the sheet is pulled**: competitors let you look at the sheet or run
   one replication; beyond "pull → replace → replicate" we can add "save as a private template", turning
   a hit's structure into a reusable asset (wired into the existing template marketplace).

## 3. Version plan

### v11.1.0 — the pull sheet (deterministic foundation, our own projects) [S]
- `lib/pull-sheet.ts`: defines the **PullSheet schema** (five columns × per shot, i.e. the unified data
  structure for every stage) plus the pure function `buildPullSheetFromScript(script, assets)`, which
  builds the sheet from script_data + storyboard/video assets (timeline = cumulative duration;
  thumbnails = asset URLs).
- A new "Pull sheet" tab on the project page: the five-column table UI (matching the information density
  of the screenshots, in the cinema design system) + CSV export.
- Visible immediately in the demo project "Signal on a Rainy Night".
- Acceptance: every one of the five columns has values in the demo project's sheet; CSV export opens;
  unit tests cover the build function.

### v11.1.1 — external video segmentation + pull sheet (BYO Vision) [M]
- Upload an external video (or paste a URL) → `ffmpeg` scene detection (reusing the beat-detect ffmpeg
  infrastructure) → per shot: in/out, duration, thumbnail and final-frame extraction (reusing
  last-frame-extractor).
- Zero-config: a deterministic skeleton sheet (cut points / durations / thumbnails) honestly labelled
  "camera language and the rest require a Vision key".
- With a Vision key configured: extract frames per shot → a Vision LLM labels them against the PullSheet
  schema (the llm-client pattern, degrading to the skeleton on failure); labelling progress runs through
  pipeline_jobs (type='pull-sheet').
- Artifacts stored as project_assets with type='pull-sheet' (a standalone "pull-sheet workbench" entry,
  usable without attaching to a specific project).
- Acceptance: the skeleton sheet runs end to end in mock mode (e2e); the labelling schema has unit-test
  validation.

### v11.1.2 — replace + replicate (the killer feature) [M]
- Pull sheet → the "replacement workbench": a global instruction (e.g. "swap every character for a cat")
  or per-dimension replacement (character / scene / prop / wardrobe), with reference image support
  (upload / character library / Cameo assets).
- Prompt rewriting: the LLM rewrites "original shot description × replacement instruction" into new
  per-shot prompts in bulk (with a rule-based fallback doing deterministic text replacement); **every
  rewritten prompt stays editable** (matching OiiOii, and capturing the "prompts as study material"
  by-product).
- Starting the replica: construct the shots (backfilling the v2.8 camera-language fields from the pull
  sheet) → start via the script adaptation path (skipping the Writer's creative stage) → generate in
  parallel → compose. Shot durations are locked to the pull sheet.
- "Save as a private template": the pull-sheet structure (structureHint + per-shot cameraWork) is
  deposited into the template marketplace.
- Acceptance: the demo case — pull a sheet from a demo video → a swap-everyone instruction → under mock
  engines, produce a new film with the same structure (identical shot count and durations, entirely new
  asset URLs); full-chain e2e.

### v11.1.3 (✅ done) — replication quality comparison [S]
- Original vs replica: run pacing-audit and hook-audit on both and compare (pacing/hook fidelity scores);
  the L2 "intent vs measured" comparison folds into the existing Vision QC module.

## 4. Risks and boundaries (the honest list)

- **Copyright sensitivity**: replicating someone else's uploaded video carries infringement risk. The
  product is positioned as "structural study + subject replacement as derivative creation", not
  frame-by-frame copying; the UI states plainly: "confirm you have the right to use the reference
  material; the replica is new content sharing its structure".
- **Vision labelling cost**: frame extraction per shot × Vision calls, so more images means longer
  parsing (the same expectation management the article describes) — labelling goes through the queue with
  progress pushed, and a shot-count guardrail (e.g. ≤60 shots).
- **Scene detection accuracy**: ffmpeg scene detect misses or over-splits films with soft transitions —
  the workbench supports merging and splitting shots by hand (a deterministic fallback that a human can
  calibrate, the same human-in-the-loop philosophy as the ledger and hook audit).
- **Non-goals**: no audio-fingerprint-level BGM identification; no extracting and reusing the original's
  footage directly (we only generate new content).
