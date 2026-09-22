# Stage 22 · The distribution/publishing loop (v12.3.x)

> Direction: connect the already strong "production layer" to "listing and monetizing" — the upgrade plan
> ranks this P0, with the highest commercial value.
> After measurement by 4 parallel readers, the tone is set: **most of the pieces already exist; what is
> missing is "stringing them into a loop + real uploads"**. Don't rebuild.
>
> **Architectural Boundary Note:** Social media distribution and publishing is strictly an **optional downstream feature** (`RF-FEAT-01`), decoupled from the system's indivisible core mandate (rendering the fully assembled `final.mp4`). The core stands complete without any external publishing connection.

---

## 1. Diagnosis (measured by 4 parallel readers)

### 1.1 Already built (don't re-propose)

- **Per-platform copy packs**: `lib/distribution.ts` covers 6 platforms (Douyin / Kuaishou / WeChat
  Channels / Xiaohongshu / YouTube Shorts / Bilibili), with an LLM producing 3 titles, tags, hooks, a
  description and posting advice → `project_assets` (type='distribution');
  `/api/projects/[id]/distribution` GET/POST.
- **Per-platform renders**: `/api/projects/[id]/export-platform` re-encodes final_video to 9:16 / 16:9 /
  1:1 / 4:5 + fit (contain/cover/blur-pad) + burned-in platform subtitles → a local mp4 (serve-file).
  `services/video-export-service.ts` `exportForPlatform`.
- **Vertical + covers + subtitles**: `vertical-composition.withVerticalHints`, `cover-candidates` (3 AI
  9:16 cover candidates + lead inference + a title safe area), `subtitle-burn` (subtitle style presets for
  5 platforms), narration `cuesToSrt` (SRT saved as an asset).
- **Export formats**: mp4 (720/1080/4K, tiered by plan-gate), EDL/FCPXML/AAF (real binaries), gif/webp/avif
  planner.
- **Publish readiness gate**: `/api/projects/[id]/publish-readiness` + `evaluateQualityGate` (vision audit
  - quality score + lip sync, pass/warn/**block**) — but it is **a read-only badge that blocks nothing**.
- **Sharing + billing**: `projects.share_token` (nanoid-18) + `project_share_tokens` (collaboration
  invites), `plan-gate` (already wired into export / 4K / video / Polish).

### 1.2 The real last-mile gaps (what this stage fills)

| Gap                                          | Evidence                                                                                                                                         | Impact                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **No unified "publish" action**              | distribution / export-platform / cover / readiness / share are all **separate, unconnected** endpoints; there is no `/api/projects/[id]/publish` | Users have to assemble title + video + cover by hand |
| **No "ready-to-post bundle"**                | Cover / video / copy are three separate downloads, with no single bundle or zip                                                                  | A broken experience                                  |
| **The quality gate is advisory only**        | Even `gate.ready=block` doesn't stop an export or a publish                                                                                      | Bad films can still ship                             |
| **No publish state or history**              | projects has no `published_at` / `published_platforms`, and there is no publish record table                                                     | You cannot look up what was published where          |
| **No scheduled publishing**                  | The posting-advice copy exists, but there is no schedule or worker trigger                                                                       | "Post at the best time" is just text                 |
| **No real uploads**                          | distribution only produces copy; there is no OAuth or platform API push                                                                          | You still have to download and upload manually       |
| **SRT is never wired into export-platform**  | The route never fetches narration's srtUrl to pass as subtitlePath                                                                               | Platform renders have no subtitles                   |
| **Cover titles are CSS overlays only**       | A browser-side overlay, never burned in server-side                                                                                              | The downloaded cover has no title                    |
| **export-platform only accepts local files** | Remote/cloud video → 400/501                                                                                                                     | Unusable in deployed/cloud scenarios                 |
| **No TikTok**                                | Neither PLATFORM_SPECS nor the subtitle presets have tiktok                                                                                      | A missing corner of international distribution       |

> **Where this landed (2026-08).** The catalog moved to the `platforms` table and now has exactly three
> destinations — `tiktok`, `instagram`, `youtube`. `PLATFORM_SPECS` is gone; the copy packs read the
> catalog. And publishing stopped being a per-provider integration: it is a **payload handed to a
> broker** (`postiz-publish-broker`), so the six-platform, per-provider picture below is the history of
> the stage, not its current shape.

---

## 2. Design philosophy (inheriting "reuse don't rebuild + deterministic + BYO + honest degradation + safety")

- **Reuse, don't rebuild**: copy packs / per-platform renders / covers / subtitles / the readiness gate /
  sharing / plan-gate are all built — v22 = **string the pieces into a loop + fill the connection gaps +
  BYO real uploads**.
- **Honest degradation (key)**: a platform we cannot reach degrades to "\*\*generate a ready-to-post bundle
  - manual upload instructions**", with the UI stating that plainly. What changed since: the reachability
    question stopped being per-provider. There is **one\** outbound path — the publish broker — and what
    decides between API and manual is whether *this user* has a connected account for *this platform\*. The
    YouTube-specific adapter that read `YOUTUBE_ACCESS_TOKEN` is gone: a token pasted by hand was itself a
    manual step, and keeping it alongside the broker meant two answers to "how do you publish to YouTube".
    The OAuth rule did not change — the broker holds the provider apps, and we never authorize on the
    user's behalf.
- **A hard gate**: turn the advisory `evaluateQualityGate` into a hard block on the **publish action**
  (level=block → 422). Publishing is the last checkpoint for "is this deliverable".
- **Safety**: never fill in any platform password or OAuth; the adapters only read tokens the user has
  configured; no token → degrade to the export bundle. Publishing is outward-facing, so confirm before
  executing.

---

## 3. Version breakdown · Stage 22 · The distribution/publishing loop (v12.3.x)

### v12.3.0 — One-click ready-to-post bundle (the deterministic core) [M] ✅ delivered (commit 104af7d)

- `lib/publish-package.ts` `buildPublishPackage(spec, pack, media)`, a pure function assembling
  **distribution copy + the film + the cover** into a "ready-to-post bundle" (platform spec + title /
  alternates / tags / topics / description + video (per-platform render preferred, falling back to the
  original) + cover + one-click copy + warnings for missing pieces + ready).
- `GET /api/projects/[id]/publish-package?platform=<id>`: pulls the DB assets (distribution / final_video /
  chosen-cover→cover-candidates) and feeds the pure function; attaches an `exportHint` (one-click export at
  that platform's aspect ratio).
- **SRT wiring fixed**: export-platform gains `resolveProjectSrtPath`, so when a platform subtitle style is
  specified it takes the SRT from the narration asset (persistent_url=srtUrl) and passes `subtitlePath` →
  **fixing the bug where subtitles were never actually burned (the path was never passed)**; the response
  gains `subtitled`.
- **Verification**: tsc clean + vitest 2373 (+5: complete → ready / falls back with a warning when there is
  no platform render / missing pieces don't error / tags truncated at the cap and an over-length title
  warns / Bilibili 16:9) + playwright (publish-package contract + platform validation). The frontend
  publish panel is wired up in v12.3.1 alongside the publish action.

### v12.3.1 — Publish gate + publish records + publish panel [M] ✅ delivered (commit fddbcf9)

- `POST /api/projects/[id]/publish`: gate order **logged in (401) → owner/editable (403) → billing gate,
  creator+ (402) → the quality gate as a hard block, `evaluateQualityGate` block → 422** (turning advisory
  into enforcement) → assemble the ready-to-post bundle + generate or reuse the share token + write a
  `publish_records` row (status='packaged'; real uploads land in v12.3.3). GET lists the records.
- The `publish_records` table (PostgreSQL exclusively, added to PROJECT_CHILD_TABLES for cascading deletes) plus
  `publish-record-repo` (recordPublish / listPublishRecords).
- Publish panel: each platform card in `DistributionPanel` gains a "publish/package" button → POST /publish,
  honestly labelled "packaged + share link (download the assets and upload manually)", with 402 → upgrade /
  422 → quality gate not passed / 401 → log in.
- **Verification**: tsc clean + vitest 2376 (+3 repo) + playwright (the publish gate 401 → 402 (free) → 200
  (creator) + records visible, with automatic setTier and cleanup).

### v12.3.2 — Locking the cover + burning in the title (bundle completeness) [S] ✅ delivered (commit 216aee7)

- `lib/cover-title-burn.ts` (pure): `buildCoverDrawtext` (font size at 4.5% of image height / horizontally
  centered / safe-area top y expressed via `h` / semi-transparent backing box + outline) + `coverFontCandidates`
  (env → macOS → Linux subtitle fonts) + `escapeDrawtextPath`. `services/cover-title-service.ts`:
  `burnCoverTitle` (ffmpeg drawtext; remote images downloaded first; **no font / no title → keep the
  original image with burned:false, honest degradation** so text never renders as tofu boxes).
- `POST /api/projects/[id]/covers/choose` (logged in + owner): pick a candidate or an imageUrl → burn the
  title → store a `chosen-cover` asset; **publish-package already prefers chosen-cover** (the v12.3.0
  interface), so the locked cover flows into the ready-to-post bundle automatically.
- **Verification**: tsc clean + vitest 2380 (+4 pure logic) + **a real burn-in test** ("Neon Manhunt · Signal
  on a Rainy Night" renders title correctly inside the safe area, not as boxes).

### v12.3.3 — BYO platform upload adapters + scheduled publishing [M]

- `lib/publish-adapters/`: a single `PublishAdapter` interface (`isConfigured()` / `upload(pkg)` /
  `status(id)`). Implement the **YouTube Data API** reference adapter (consuming the user's configured
  `YOUTUBE_*` token, resumable upload); Douyin / Bilibili / Xiaohongshu get **the adapter contract + honest
  degradation** (no public API / no token → return "export bundle + manual upload instructions" rather than
  pretending to be able to upload).
- Scheduled publishing: a `scheduled_publishes` table + a worker tick (or reuse the pipeline-job queue),
  calling `adapter.upload` when the time comes. **Safety**: a real upload requires user confirmation before
  it runs (outward-facing); the user does their own OAuth. **Verification**: tsc + unit tests (adapter
  selection / degradation without a token / the schedule firing on time, all mocked with no real uploads).

### v12.3.4 — TikTok + cloud video export fix + wrap-up [S]

- Add **TikTok** to `PLATFORM_SPECS` and the subtitle presets (international 9:16).
- export-platform supports **remote/cloud video URLs** (download to a temp file first, then encode; fixing
  the 400/501) → usable in deployed/cloud scenarios. **Verification**: tsc + unit tests (the TikTok spec /
  the remote-URL download branch) + a full regression.

> **Closing out stage 22** = a complete distribution loop from finished film to "ready-to-post bundle + a
> hard gate + publish records + scheduling + real uploads".
>
> **What "real uploads" became.** Not one adapter per provider, but one payload delivered to a broker
> that owns the provider clients and the OAuth apps. Three destinations, one `POST /posts`, and the only
> per-platform difference is a `settings` block. A submitted post is `queued` — never `published` — until
> the broker says otherwise, by webhook for latency and by a reconciliation cron for truth. The broker is
> a port with two implementations: `PUBLISH_BROKER=postiz` talks to the instance, `fake` runs the whole
> loop in memory, and the fake refuses to start outside development. See
> `openspec/changes/postiz-publish-broker/`.

---

## 4. Risks and non-goals

- **Non-goals**: never perform platform OAuth or login on the user's behalf (safety rule); never fake
  "one-click publish" for Chinese platforms with no public API (degrade honestly to an export bundle);
  don't build our own platform account system.
- **Risk**: platform APIs change often and have regional restrictions → the adapter interface isolates
  them, and a failure never prevents producing the bundle; a real upload is confirmed by the user first.
- **Honest degradation**: no platform token / no public API → fall back to "the film bundle + manual upload
  instructions", and the UI never claims "published"; `published_at` is only written on a genuinely
  successful publish.
- **Privacy/security**: platform tokens live only in `.env.local` / the user's configuration (gitignored,
  never committed or printed); publishing is outward-facing and is confirmed before it runs.
