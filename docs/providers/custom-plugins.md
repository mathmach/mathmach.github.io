# 🛠️ Bring Your Own (BYO) Provider Plugin Guide

Wind Comic provides an extensible plugin interface (`@wind/ai/provider-registry`) allowing teams to integrate custom Image, Video, and TTS endpoints in minutes with **zero changes to the core orchestrator**.

---

## 1. Fast Integration Pattern (Single File)

To integrate a new engine, create a single `.ts` file inside the respective provider directory:

- Image: `apps/web/lib/image-providers/`
- Video: `apps/web/lib/video-providers/`
- Speech: `apps/web/lib/tts-providers/`

### Example: Custom Video Provider

```typescript
// apps/web/lib/video-providers/my-custom-video.ts
import { registerVideoProvider } from "./registry";
import type { VideoGenerateInput } from "./types";

if (process.env.MY_VIDEO_API_KEY) {
  registerVideoProvider({
    id: "my-custom-video",
    name: "Enterprise Custom Video",
    priority: 80, // Lower priority runs first (ComfyUI default sits at 135)

    // Capability flags
    supportsImage2Video: true,
    supportsText2Video: true,
    supportsLastFrame: false,
    supportsSubjectReference: true,
    maxDurationSec: 10,
    supportsNativeAudio: false,

    available: () => Boolean(process.env.MY_VIDEO_API_KEY),

    async generate(input: VideoGenerateInput) {
      const response = await fetch(
        "https://api.example.com/v1/generate-video",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.MY_VIDEO_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: input.prompt,
            image_url: input.firstFrameUrl,
            duration: input.durationSec ?? 5,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Upstream video generation failed with status: ${response.status}`,
        );
      }

      const data = await response.json();
      return {
        videoUrl: data.output_video_url,
        provider: "my-custom-video",
      };
    },
  });
}
```

Add your environment variable to `apps/web/.env.local`:

```bash
MY_VIDEO_API_KEY=sk_custom_xxxxxxxxxxxx
```

Restart the dev server (`bun run dev`). The registry automatically discovers the provider and inserts it into the execution chain according to its priority.

---

## 2. Modality Capability Flags & Contracts

Each modality defines specific capability flags that the dispatcher matches against incoming shot requirements:

### Image Providers (`ImageProvider`)

- **`supportsRefs` (`boolean`):** Indicates if the engine supports subject reference images (`cref` / `sref`).
- **`maxRefImages` (`number`):** Maximum reference images accepted (e.g. 1 to 5).
- **`supportsControlImage` (`boolean`):** Indicates if the engine accepts ControlNet lineart/sketch guides.

### Video Providers (`VideoProvider`)

- **`supportsImage2Video` (`boolean`):** Required when a storyboard keyframe image is supplied.
- **`supportsText2Video` (`boolean`):** Required for pure text prompts without initial frames.
- **`supportsLastFrame` (`boolean`):** Accepts first and last frame for seamless cut transitions.
- **`supportsSubjectReference` (`boolean`):** Multi-subject identity consistency via image references.
- **`maxDurationSec` (`number`):** Maximum video duration supported in a single generation call.
- **`supportsNativeAudio` (`boolean`):** Indicates if the engine outputs sound/SFX directly.

### Speech / TTS Providers (`TTSProvider`)

- **`supportsEmotion` (`boolean`):** Accepts emotional tone direction in speech generation.
- **`supportsCloning` (`boolean`):** Supports zero-shot voice cloning from audio sample URLs.
- **`supportsStreaming` (`boolean`):** Emits audio chunks as they are generated.
- **`maxTextLen` (`number`):** Text character cap for a single narration block.
- **`supportedLanguages` (`string[]`):** Array of ISO language codes (empty array = universal).

---

## 3. Directory Auto-Discovery

For dynamic, uncompiled plugin loading, specify a directory in your environment variables:

```bash
IMAGE_PROVIDERS_DIR=/opt/wind-comic/custom-image-plugins
VIDEO_PROVIDERS_DIR=/opt/wind-comic/custom-video-plugins
TTS_PROVIDERS_DIR=/opt/wind-comic/custom-tts-plugins
```

At application boot, the server dynamically scans and imports all `.ts`, `.mjs`, and `.cjs` files inside these directories, executing their registration blocks.

---

## 4. Built-In Provider Priorities

| Modality         | Built-in ID  | Priority | Primary Role                                                        |
| :--------------- | :----------- | :------- | :------------------------------------------------------------------ |
| **Image**        | `comfyui`    | `130`    | High-quality IP-Adapter and ControlNet image generation.            |
| **Image (Dev)**  | `mock-image` | `999`    | Fast zero-cost mock image generator for unit tests and offline dev. |
| **Video**        | `comfyui`    | `135`    | Local ComfyUI video workflow execution.                             |
| **Speech**       | `comfyui`    | `40`     | Neural TTS synthesis via ComfyUI audio nodes.                       |
| **Speech (Dev)** | `mock-tts`   | `999`    | Offline silent audio generator for fast pipeline testing.           |

To prioritize your custom plugin ahead of ComfyUI, configure its priority lower than the built-in value (e.g. `priority: 50`).
