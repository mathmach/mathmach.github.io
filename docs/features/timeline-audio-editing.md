# Stage 20 · Intelligent editing (rhythm / emphasis / taste) + preview audio (v12.x)

> Trigger: user feedback that "the editing in the latest version isn't professional or tasteful — it
> just concatenates clips, with no sense of rhythm, emphasis or taste" and "neither the clip preview nor
> the finished-film preview has sound". The ask: find open-source algorithms/skills for comic-drama,
> film and short-form editing on GitHub/HuggingFace, adapt them to this project → write them into the
> iteration plan; fix the silent previews at the same time.

---

## 1. Diagnosis of the current state (all measured, not guessed)

### 1.1 Editing = pure concatenation; the rhythm algorithms are sitting unused

- `services/video-composer.ts` currently concatenates in `shot.duration` order with xfade transitions and
  an amix audio mix — **the shot durations are the static values the Writer produced, so cut points
  follow neither the music's beats nor the emotional arc**.
- **Key finding**: the project has long had `snapDurationsToBeats` in `lib/beat-detect.ts` (snapping a
  shot's out point to a BGM beat within a ±150ms window) plus `findNearestBeat` — but **the only caller
  in the entire repo is hook-audit, which uses it to "measure a beat alignment score" (v10.6.2); it has
  never been wired into the composer to actually change the edit**. The algorithm is ready, needs no new
  dependency, and sits idle.
- `lib/emotion-curve.ts` has `computeEmotionCurve / rhythmFor / emotionScore` (emotional intensity →
  rhythm value), which also drives nothing in the edit.
- Conclusion: **every building block for rhythm and emphasis exists; they were simply never assembled
  into a "rhythmic editing" pipeline.**

### 1.2 Preview audio (measured with ffprobe)

| Subject                                      | Measured                          | Conclusion                                                                                                                                |
| -------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Real composed films in `data/composed/*.mp4` | **77/77 all have an audio track** | The composer's audio mixing **works** — not a bug                                                                                         |
| Bare generated clips (type='video')          | Some have no audio track          | The generation models produce silent video (audio is only mixed in at the composition stage) → **per-shot previews are naturally silent** |
| Some old final_video files                   | No audio track                    | The TTS/BGM keys were missing at generation time, so the film ended up silent                                                             |

- The real gap is **(a) clip previews have no audio track** (by design, audio is deferred to composition)
  and **(b) the finished film's audio isn't guaranteed** (silent when keys are missing, with no health
  check or self-healing). It is not "the composer doesn't mix audio".

---

## 2. Literature review: open-source editing algorithms on GitHub / HuggingFace

| Project                                                  | What it is                                                                                                                                                                                                                                      | What we can borrow                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CutClaw** (GVCLab, arxiv 2603.29664, open source)      | Multi-agent music-synced editing: **Playwriter** (reads the music's beats/energy/sections to set the script) → **Editor** (cuts shots aligned to beats) → **Reviewer** (QC: plot relevance, taste, instruction adherence, dropping weak frames) | **An architectural blueprint** — the three agents map exactly onto what we already have: beat-detect (beats) + pacing-audit/emotion-curve (energy/sections) / existing per-shot generation / vision-audit + quality-gate (QC). Plus one-sentence style control (fast cutting vs slow storytelling) |
| **BeatSync Engine** (Merserk)                            | Beat grid + energy segmentation: **stretch shots in calm sections, cut fast in high-energy ones**, with optional Qwen3-VL semantic shot selection                                                                                               | The "energy-driven rhythm" formula ports directly into the composer                                                                                                                                                                                                                                |
| **montage-ai** (mfahsold)                                | Local-first: transcription-driven editing + beat cuts + OTIO/EDL export                                                                                                                                                                         | EDL export already exists (v9.2 AAF/EDL); beat cutting is what we're adding                                                                                                                                                                                                                        |
| **videoclipgenerator / Vibe Music Engine** (lazniak)     | Whisper + beat detection → EDL, cuts synced to the music                                                                                                                                                                                        | Confirms "beats → cut points" as the mainstream approach                                                                                                                                                                                                                                           |
| **PySceneDetect** / HF **fffiloni/scene-edit-detection** | Content/motion-aware scene segmentation + timecodes                                                                                                                                                                                             | v11.1.1's external segmentation already uses ffmpeg scene detect; can be upgraded with minShotSec / motion awareness                                                                                                                                                                               |

**Adoption strategy (consistent with the project's "deterministic heuristics + BYO" philosophy)**:

- **Do not pull in heavy Python/ComfyUI/madmom dependencies** — those are standalone Python toolchains;
  **port the algorithms into the existing ffmpeg composer** instead.
- madmom's beat detection → replaced by the project's existing `detectBeats` (ffmpeg silencedetect);
  CutClaw's three agents → assembled into a deterministic pipeline from the project's existing
  beat-detect / emotion-curve / pacing-audit / vision-audit; the LLM's "one-sentence style control"
  becomes an optional BYO enhancement layer.

---

## 3. Stage 20 A · Intelligent editing (v12.0.x)

### v12.0.0 — Wire up beat-aligned cutting (deterministic, connecting the idle algorithm) [S]

- Shot out points in the composer are snapped to BGM beats via
  `snapDurationsToBeats(durations, detectBeats(bgm))` (±150ms); no BGM or no detectable beats → left
  untouched (honest degradation).
- Acceptance: for films with BGM, the beat alignment rate of cut points goes up (compared before and
  after with hook-audit's bgmSync metric); no regressions.

### v12.0.1 — Emotional rhythm curve (energy-driven pacing) [M]

- `computeEmotionCurve(shots)` → a target-duration weight per shot: **emotional peaks and lyrical shots
  stretch (slow), action and high-tension shots compress into fast cuts (fast)** (BeatSync's "calm holds
  / energy cuts"). Duration is redistributed before the beat snapping, conserving total runtime.
- A pure function in `lib/edit-rhythm.ts` (unit testable): per-shot emotion/tension/duration in →
  redistributed target durations out.

### v12.0.2 — Emphasis [M]

- Reuse pacing-audit (reversal shots) and hook-audit (opening hook / episode-ending cliffhanger shots) to
  mark "key shots" → key shots get a longer hold + an emphasis transition (push-in / freeze); weak
  connective shots (low conflict score) are compressed or cut through quickly.
- "Emphasis" = no longer distributing attention evenly, but weighting the duration and transition budget
  toward the narratively important shots.

### v12.0.3 — Transition taste [S]

- Choose transitions automatically from the relationship between adjacent shots: match cut / hard cut
  within a scene, J-cut/L-cut across scenes (the composer already has the j/l-cut adelay path; this adds
  the automatic _selection_), dissolves at emotional turns. Transition landings align to beats.

### v12.0.4 (optional BYO) — One-sentence edit style control [M] ✅ delivered (commit ddb704e)

- CutClaw-style: one user sentence ("fast-paced and pumped" / "slow and lyrical") → style parameters
  (`compressionBias` for how hard to compress + `cutBias` for how hard or soft the transitions are), fed
  into the deterministic v12.0.1–.3 pipeline. Without a key it uses the default style.
- Implementation: two layers in `lib/edit-style.ts` — the rule layer `resolveEditStyleRule` (keyword
  dictionary, runs with zero config) and the LLM layer `resolveEditStyle` (with a key, maps free text to
  parameters, allowlist-sanitized and clamped, falling back to the rule layer on failure / no key /
  MOCK).
- Modulation points: `applyEmotionPacing` gains `compressionBias` (scaling only the amount of
  compression; full-length shots never move); `selectTransitions` gains `cutBias` (a hard-cut pool and a
  soft pool + a tension→cut threshold, with explicit hard cuts preserved). End to end: preset chips +
  a free-text box on the create page → create-stream → CreatePipelineInput.editStyle →
  orchestrator.setEditStyle → composeVideo.
- **This closes out stage 20 A, intelligent editing** (beats / emotion / emphasis / transitions / style
  control — all five delivered).

---

## 4. Stage 20 B · Preview audio (v12.1.x)

### v12.1.0 — Guarantee the finished film's audio + health check and self-heal [S]

- After composition, verify with `ffprobe` that the film contains an audio stream; if it is missing,
  re-mux with at least the BGM (never ship a silent film); record a `hasAudio` flag on the final_video
  asset.
- An audio badge in the UI's finished-film area (has sound / silent + the reason), with a one-click
  "add audio and recompose" for silent films.

### v12.1.1 — Clip preview audio [M]

- Path one: when the generation model supports native audio (native audio mode), request
  `generate_audio` → the clip carries its own sound.
- Path two (fallback): the clip preview overlays that shot's TTS voiceover asset (shot-audio), aligning
  a `<video>` with a synchronized `<audio>`; shots without a voiceover are explicitly labelled "this clip
  has no separate audio track; the finished film includes score and voiceover".

### v12.1.2 — Preview experience [S] ✅ delivered (commit 22e57b4)

- A "listen with sound" toggle per shot on the video tab (mute/restore that shot's audio, controlled via
  aria-pressed, shown only when there is an audible source); a three-state readiness badge.
- Landed honestly: there is no per-clip "score" (BGM is film-level only), so the three states resolve to
  what the clip really has — **with voiceover (TTS overlay) / native audio track (present in the bare
  clip, labelled only when detected) / no separate audio track (the finished film has score and
  voiceover)**. Native audio is only claimed on positive evidence
  (webkitAudioDecodedByteCount / mozHasAudio / audioTracks) — never assumed.
- `components/project/clip-with-audio.tsx`: a three-effect state machine (native detection / overlay
  synchronization / listen toggle → audio source switching). Finalized after an adversarial three-lens
  review with each point refuted in turn.
- **This closes out stage 20 B, preview audio** (clip overlay → finished-film health check and self-heal
  → preview experience).

---

## 5. Risks and non-goals

- **Non-goals**: no in-house music generation or separation; no heavy Python dependencies such as madmom
  or PySceneDetect (port the algorithms, don't import the runtime).
- **Risk**: beat snapping changes shot durations → total runtime must be conserved and lip sync must not
  break (lip sync lives on the voiceover track, so the adelay chain has to move with the beats).
  Mitigation: recompute adelay whenever durations are redistributed; e2e verifies audio and picture stay
  in sync.
- **Honest degradation**: no BGM / no beats / no emotion data → fall back to even concatenation (today's
  behaviour) rather than pretending to have rhythm.
