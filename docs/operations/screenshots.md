# 📸 Screenshot manifest · the real-app screenshot checklist

> **Automation**: run `bun scripts/capture-screenshots.ts` from `apps/web` to capture the 9 main screenshots into
> `assets/screenshot-*.png` in one go.
> Prerequisites: the dev server on :3000 (`bun run dev` from the repo root) and a seeded demo user (`demo@windcomic.app`; the
> password is DEMO_PASSWORD in apps/web/.env.local).
> Automated coverage: home / dashboard / create / projects / assets / storyboard / cinema-timeline /
> pacing / comments / workshop (10 shots).
> **Not automated**: the collaboration scenario (two windows side by side) / the invite popover / the
> notification bell dropdown — these need a human (two browsers + interacting with overlays).
>
> Below is what still needs to be shot by hand, plus the full checklist.

---

## 1️⃣ Shooting environment conventions

- **Machine**: a Mac high-DPI display (Retina 2x), dark mode
- **Window size**: 1440 × 900 (the marketing standard); 1200 × 800 for important modals
- **Data**: use a demo project (`Lingmou · Short Comic Drama`, or create a new "the CEO exposes them in the
  street" short drama)
- **Collaboration scenario**: two browsers side by side (one window is the main user = "you", the other is
  "alice", with different avatar colours)
- **One consistent idea text**: "a reborn CEO exposes his ex-fiancee's wedding scam in the middle of the
  street" (used across every screenshot)
- **Format**: PNG, ≤ 800KB per image, optimized with `tinypng.com` or `oxipng`
- **Filenames**: `screenshot-<module>.png` (overwriting the old ones)
- **Location**: `assets/`

---

## 2️⃣ The must-shoot list (in README order)

### 📷 1. Dashboard creation overview

- **Path**: `/dashboard`
- **Elements**:
  - the API quota warning banner at the top
  - the notification bell (better with an unread dot)
  - the project count / recent creations feed
- **File**: `screenshot-dashboard.png`

### 📷 2. The authoring workshop

- **Path**: `/dashboard/create`
- **Elements**:
  - the SlateCard at the top + the test-shot button
  - the idea input (paste the standard idea text)
  - the story template library expanded (18 built in + a few personal ones)
  - engine selector / camera language picker / duration / aspect
  - the "🎬 test-shoot 1 shot" and ROLL buttons in the bottom right
- **File**: `screenshot-create.png`

### 📷 3. Polish Studio Pro

- **Path**: `/dashboard/polish` (or the script polish entry point)
- **Elements**: the Basic vs Pro switch + the McKee/Field/Seger frameworks + multi-dimension review +
  before/after diff
- **File**: `screenshot-polish.png`

### 📷 4. Asset library

- **Path**: `/dashboard/assets`
- **Elements**: the category tabs (characters / scenes / templates) + search + the thumbnail grid
- **File**: `screenshot-assets.png`

### 📷 5. My projects

- **Path**: `/dashboard/projects`
- **Elements**: the project card grid, with automatic covers + the ScoreDonut quality badge + the Sparkline
  trend
- **File**: `screenshot-projects.png`

### 📷 6. Storyboard detail (storyboard tab)

- **Path**: `/projects/<id>` → the storyboard tab
- **Elements**:
  - several storyboard cards showing the Cameo retry score + the Style Audit dimensions popover
  - at least one carrying a "✓ re-rendered" badge
  - a score bubble on hover
- **File**: `screenshot-storyboard.png`

---

## 3️⃣ 🆕 The new v3.0+ modules (must shoot)

### 📷 7. Cinema Timeline (multi-track + collaboration)

- **Path**: `/projects/<id>` → the timeline tab
- **Elements (important!)**:
  - three rows clearly visible: storyboard thumbnail cards / BGM segments (with waveform) / subtitle
    segments
  - **at least one BGM segment showing a real waveform** (only exists after a project has produced a
    finished film, so run `bun run dev` and complete one project first)
  - at least one segment in the "edited" state (amber ring)
  - **how to shoot the collaboration mode**: log in as alice in a second browser with the same page open and
    have alice hover over the timeline → the main screenshot shows alice's coloured cursor and her "alice"
    name tag
  - segment lock demo: alice clicks a BGM segment and starts dragging, so the main screenshot shows the
    dashed border and the "🔒 alice is editing" badge
- **File**: `screenshot-cinema-timeline.png`
- **Optional extra GIF**: `screenshot-timeline-collab.gif` (a 5s demo of dragging + the snap flash + the lock
  badge appearing)

### 📷 8. Pacing analysis

- **Path**: `/projects/<id>` → the pacing tab
- **Elements**:
  - the 3 KPI cards (average conflict score / reversal count / passed vs needs work)
  - the main bar chart: a conflict-score bar per shot (green/amber/red) + polarity icons (▲▼ —) + reversal
    arrows
  - the warnings list and suggestions list at the bottom (at least 3 entries)
- **File**: `screenshot-pacing.png`

### 📷 9. Invite collaborators

- **Path**: `/projects/<id>` → the UserPlus button popover in the nav, expanded
- **Elements**:
  - the current collaborator list (at least one real avatar + a role select)
  - the create-invite section: role select + expiry select + the generate button
  - the list of issued links (at least one)
- **File**: `screenshot-invite.png`

### 📷 10. The public /project-invite/[token] page

- **Path**: the accept-invite page from the recipient's perspective
- **Elements**: the project preview card (cover + title) + the role permissions explanation + the "accept
  invite" CTA
- **File**: `screenshot-invite-landing.png`

### 📷 11. Comments + @mentions

- **Path**: `/projects/<id>` → the comments tab
- **Elements**:
  - the project-level CommentThread (at least 3 comments + 1 reply)
  - one comment with an @mention (highlighted amber)
  - the collapsed per-shot details below (at least one expanded)
  - the input showing the @ autocomplete dropdown (open)
- **File**: `screenshot-comments.png`

### 📷 12. The NotificationBell notification center

- **Path**: the bell in the top right of the dashboard, opened
- **Elements**: the notification popover with at least 3 entries (a few mentions and replies) and the unread
  dot
- **File**: `screenshot-notifications.png`

### 📷 13. Single-shot regeneration modal (Storyboard Regen Modal)

- **Path**: the shot workshop tab → any shot → "edit prompt and regenerate" opens the modal
- **Elements**: the current image + the prompt editor + the Style Bible / cref toggles + the aspect select +
  (v2.24 B) the reference image upload area
- **File**: `screenshot-regen-modal.png`

### 📷 14. The shot workshop tab

- **Path**: `/projects/<id>` → the shot workshop tab
- **Elements**: the per-shot row list, with the "edit prompt and regenerate" and "4K re-render" buttons;
  already re-rendered shots carry a green ✓
- **File**: `screenshot-workshop.png`

### 📷 15. The public template share page (OG card preview)

- **Path**: the public `/template/<token>` page
- **Elements**: icon + name + description + tags + the clone button + view/clone counts
- **File**: `screenshot-template-share.png`
- **Optional**: `screenshot-template-og-card.png` — the 1200×630 card generated automatically for og:image
  (open inspect in the browser, find `<meta og:image>` and download it directly)

---

## 4️⃣ Marketing-only (optional, raises the production value)

### 📷 16. Hero / banner shot

- The "wow" screenshot with the project page + timeline + collaboration cursors + notifications + invites all
  open at once. Used to replace the README banner.
- **File**: `banner.png`

### 📷 17. Side-by-side comparison GIF

- One side: a single-prompt generator producing only a rough 5-second clip
- The other: Wind Comic producing a polished 30 seconds with subtitles and voiceover
- **File**: `comparison-generation.gif`

### 📷 18. Pipeline flow animation

- The 8 agent names lighting up one at a time, 1s each, with a progress bar
- **File**: `pipeline-flow.gif`

### 📷 19. Multi-user collaboration demo

- Two browsers side by side on the timeline, both cursors syncing live, with segment locks switching
- **File**: `realtime-collab-demo.gif` (≤15s)

### 📷 20. BGM waveform + drag demo

- Dragging a BGM segment to a different position + automatic snapping to its neighbour + the real waveform
  moving with it
- **File**: `bgm-waveform-snap.gif` (≤10s)

---

## 5️⃣ When you're done

- Put all the new screenshots into `assets/`, **keeping the old filenames** (overwrite) so the README links
  follow automatically
- If you do rename them, update the src paths in `README.md` and `README.zh-CN.md` to match
- Optional: batch-add a shadow and slight rounding with imagemagick for a more polished look:
  ```bash
  for f in screenshot-*.png; do
    magick "$f" \( +clone -background black -shadow 30x10+0+5 \) +swap -background none -layers merge +repage "shadow-$f"
  done
  ```

---

## 6️⃣ Who shoots them

Candidates:

- the user themselves (you)
- a team designer (Figma / Sketch users preferred)
- a community contributor (open a GitHub issue titled "good first issue: refresh screenshots")

Time: one evening (about 2 hours) is enough for the whole set.

---

_Screenshot checklist documentation._
