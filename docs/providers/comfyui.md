# 🎨 ComfyUI Media Engine & Workflow Catalog

Wind Comic delegates all heavy generative media tasks—Image, Video, Audio/TTS, Lip Sync, Music, and Covers—to **ComfyUI**.

---

## 1. Engine Configuration

ComfyUI operates as an asynchronous worker daemon. In `apps/web/.env.local`, declare the connection URL and the JSON workflow paths:

```bash
# Base ComfyUI Server URL
COMFYUI_URL=http://localhost:8188

# Workflows directory or specific artifact files
COMFYUI_IMAGE_WORKFLOW=/path/to/image_workflow.json
COMFYUI_IMAGE_REF_WORKFLOW=/path/to/image_ref_workflow.json
COMFYUI_IMAGE_SKETCH_WORKFLOW=/path/to/image_sketch_workflow.json
COMFYUI_VIDEO_WORKFLOW=/path/to/video_workflow.json
COMFYUI_FLF_WORKFLOW=/path/to/first_last_frame_workflow.json
COMFYUI_TTS_WORKFLOW=/path/to/tts_workflow.json
COMFYUI_LIPSYNC_WORKFLOW=/path/to/lipsync_workflow.json
COMFYUI_MUSIC_WORKFLOW=/path/to/music_workflow.json
COMFYUI_COVER_WORKFLOW=/path/to/cover_workflow.json
```

> [!IMPORTANT]
> **Availability Contract:**  
> A ComfyUI modality is reported as `available()` only when **both** `COMFYUI_URL` is reachable **and** the specific modality's workflow JSON file exists on disk.

---

## 2. Modality Workflow Matrix

| Modality                | Environment Variable            | Required Placeholders                               | Key Capabilities                                         |
| :---------------------- | :------------------------------ | :-------------------------------------------------- | :------------------------------------------------------- |
| **Standard Image**      | `COMFYUI_IMAGE_WORKFLOW`        | `%prompt%`, `%seed%`, `%width%`, `%height%`         | Baseline text-to-image (SDXL / Flux).                    |
| **Reference Image**     | `COMFYUI_IMAGE_REF_WORKFLOW`    | `%prompt%`, `%ref1%` (up to `%ref5%`), `%seed%`     | Multi-subject visual identity locking (IP-Adapter).      |
| **Sketch / ControlNet** | `COMFYUI_IMAGE_SKETCH_WORKFLOW` | `%prompt%`, `%control_image%`, `%seed%`             | Storyboard pose and lineart control (ControlNet).        |
| **Video Generation**    | `COMFYUI_VIDEO_WORKFLOW`        | `%prompt%`, `%image%`, `%duration%`, `%seed%`       | Image-to-Video (I2V) rendering.                          |
| **First/Last Frame**    | `COMFYUI_FLF_WORKFLOW`          | `%prompt%`, `%image%`, `%last_image%`, `%duration%` | Frame interpolation and transition generation.           |
| **Speech / TTS**        | `COMFYUI_TTS_WORKFLOW`          | `%text%`, `%voice%`, `%language%`, `%speed%`        | Neural voiceover and narration synthesis.                |
| **Lip Sync**            | `COMFYUI_LIPSYNC_WORKFLOW`      | `%video%`, `%audio%`                                | Audio-to-viseme lip synchronization (Wav2Lip / ComfyUI). |
| **Music / BGM**         | `COMFYUI_MUSIC_WORKFLOW`        | `%prompt%`, `%duration%`                            | Ambient score and background music generation.           |
| **Cover Generation**    | `COMFYUI_COVER_WORKFLOW`        | `%prompt%`, `%image%`, `%seed%`                     | 9:16 vertical poster key-art synthesis.                  |

---

## 3. Template Placeholder Interpolation

All ComfyUI workflows are exported from the ComfyUI web UI using **Save (API Format)**. Before submission to ComfyUI's `/prompt` endpoint, the template engine (`@wind/ai/comfyui/template.ts`) binds variables:

- **Typed Values:** A placeholder that spans an entire field (e.g. `"seed": "%seed%"`) is converted to its proper native type (e.g., numerical integer).
- **String Interpolation:** Placeholders embedded within text strings (e.g. `"portrait of %prompt%, 8k"`) are interpolated cleanly as strings.
- **Pre-Uploaded Media:** Image placeholders (`%image%`, `%control_image%`, `%ref1%`) are uploaded to ComfyUI's `/upload/image` endpoint first, and their resulting server filenames are injected into the graph.

---

## 4. Hardware Sizing & Recommended Models

- **GPU:** Minimum 16GB VRAM (NVIDIA RTX 3090, 4090, or A10G); 24GB+ recommended for concurrent video generation.
- **Image Checkpoints:** SDXL Base 1.0, DreamShaper XL, or Flux.1-dev.
- **Video Checkpoints:** Wan 2.1, Kling ComfyUI wrapper, or SVD-XT.
- **Audio Checkpoints:** F5-TTS or CosyVoice.
