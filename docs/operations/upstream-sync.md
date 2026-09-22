# Upstream sync

This repository is a fork of **[ChrisChen667788/wind-comic](https://github.com/ChrisChen667788/wind-comic)**, which
remains the upstream project. We develop independently on our own `main`, but we keep pulling upstream's work in
from time to time — upstream is the base, not a one-off copy.

## Where we forked

| | |
|---|---|
| Upstream | `https://github.com/ChrisChen667788/wind-comic` (branch `main`) |
| Last synced upstream commit | `c83e1cf` — *v12.320: the landing-page promo GIF goes from "only the first 7 seconds" to covering the whole film* |
| Tag marking that point | `upstream-sync-2026-08-13` |
| Synced on | 2026-08-13 |

Our history descends from upstream's, so `git merge-base` already knows where the two lines split — there is no
manual bookkeeping to keep in step. The tag exists only so a human can read a diff without looking up the SHA.

## What diverged

The fork's defining change is a **full zh→en translation** of the source: comments, internal strings, test names
and fixtures. Measured at the sync point above, that is **1284 of 1989 tracked files** (~64%), `+19,769 / −43,078`
lines — the deletions are largely comments the translation dropped.

The practical consequence: **any upstream commit that touches a translated line conflicts.** Merges are never
clean here, and that is expected rather than a sign something went wrong.

## Remotes

`upstream` is configured fetch-only — its push URL is deliberately set to `DISABLED` so nothing can be pushed
there by accident, and `tagOpt = --no-tags` keeps upstream's release tags out of our repo.

```bash
git remote -v
# origin    git@github.com:mathmach/wind-comic.git   (fetch/push)
# upstream  https://github.com/ChrisChen667788/wind-comic.git (fetch)
# upstream  DISABLED                                          (push)
```

To recreate that setup on a fresh clone:

```bash
git remote add upstream https://github.com/ChrisChen667788/wind-comic.git
git remote set-url --push upstream DISABLED
git config remote.upstream.tagOpt --no-tags
git config rerere.enabled true
git config rerere.autoupdate true
```

## Syncing

```bash
# 1. see what upstream has done since our last sync
git fetch upstream main
git log --oneline upstream-sync-2026-08-13..upstream/main
git diff --stat upstream-sync-2026-08-13..upstream/main

# 2. merge — in small batches, not one giant catch-up
git merge <a-commit-partway-along>   # repeat, rather than merging months at once
git merge upstream/main              # once the batches have caught up

# 3. move the marker after a successful sync
git tag -f upstream-sync-YYYY-MM-DD upstream/main
```

Update the table at the top of this file whenever the marker moves.

### Rules that make this survivable

- **`git rerere` is enabled** (`rerere.enabled` + `rerere.autoupdate`). It records how each conflict was resolved
  and replays that resolution automatically the next time the same hunk conflicts. On a translated fork the same
  regions collide over and over, so this is what keeps repeated merges affordable. Don't turn it off.
- **Merge in small batches.** `git merge <sha>` on an intermediate upstream commit works exactly like merging the
  branch head, and keeps each conflict the size of one feature.
- **Resolve by intent, not by text.** On a translated base the conflict markers are misleading — read
  `git log -p <sync-tag>..upstream/main -- <file>` to understand *what upstream changed*, then reapply that change
  to our English code.
- **Never `git merge -X ours`.** It silently discards upstream's side of every conflicting hunk, so a fix looks
  integrated when it isn't.
- **Keep our own README/docs edits small.** Every line we change in a file upstream also maintains is a line that
  conflicts on the next sync.

If the cost of merging ever outgrows the benefit, the exit is to stop merging and treat upstream as a reading
reference — follow their `git log -p` and port by hand only what we want.
