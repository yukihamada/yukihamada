

# Plan: Fix Video Display and Enhance Play Button

## Issues Identified

### Issue 1: Videos Not Displaying
The videos are stored correctly in the database content (I verified they exist), but **DOMPurify is stripping out the `<video>` and `<source>` tags** during sanitization. The current allowed tags list doesn't include video elements.

**Current DOMPurify config (line 445-450):**
```typescript
ADD_TAGS: ['figure', 'figcaption', 'iframe', 'details', 'summary', 'pre', 'code', 'button'],
ADD_ATTR: ['data-play-track-id', 'data-youtube-video-id', 'style', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'decoding', 'open'],
```

**Missing:** `video`, `source` tags and `controls`, `autoplay`, `muted`, `loop`, `playsinline`, `src`, `type` attributes.

### Issue 2: Play Button Not Clear Enough
The current play button has:
- A small pulsing circle with SVG triangle
- The triangle may be too small/subtle
- Needs a more prominent, iconic "play" design that instantly communicates "click to play"

---

## Solution

### Step 1: Add Video Tags to DOMPurify Allowlist
Update the sanitization config to include HTML5 video elements:

**File:** `src/pages/BlogPost.tsx` (lines 445-450)

```typescript
return DOMPurify.sanitize(processed, {
  ADD_TAGS: ['figure', 'figcaption', 'iframe', 'details', 'summary', 'pre', 'code', 'button', 'video', 'source'],
  ADD_ATTR: ['data-play-track-id', 'data-youtube-video-id', 'style', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'decoding', 'open', 'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'src', 'type'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|\/)/i,
});
```

### Step 2: Redesign Music Play Button
Create a more prominent play button with:
- **Larger, bolder triangle play icon** (like YouTube's iconic red play button)
- A clear visual hierarchy that says "PLAY"
- Video-player-style design with prominent center play icon

**Updated design (lines 386-407):**

```
+------------------------------------------------------+
|  [Album Art]   Track Title                 [▶ PLAY]  |
|   (circle)     "I Need Your Attention..."  (big btn) |
+------------------------------------------------------+
```

The new play button will feature:
- Large circular play icon (similar to YouTube's design)
- Bold triangle icon with proper spacing
- High contrast colors for visibility
- Hover animation that scales up

---

## Technical Changes Summary

| File | Change |
|------|--------|
| `src/pages/BlogPost.tsx` | Add `video`, `source` to ADD_TAGS |
| `src/pages/BlogPost.tsx` | Add `controls`, `autoplay`, `muted`, `loop`, `playsinline`, `src`, `type` to ADD_ATTR |
| `src/pages/BlogPost.tsx` | Redesign `[play:trackId]` button with larger, more prominent triangle play icon |

---

## Expected Result
1. **Videos** will render properly with autoplay, muted, loop as originally intended
2. **Play button** will have an unmistakable "play" appearance with a bold triangle icon

