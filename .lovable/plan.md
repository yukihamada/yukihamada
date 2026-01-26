

# Podcast-Style Blog Read Aloud Enhancement

## Overview

Transform the blog TTS feature from a simple "read aloud" into an immersive podcast listening experience with:
1. **Podcast-style UI** - Modern player design with album art, waveform visualizer
2. **Optional background music** - Lo-fi/ambient music that auto-plays (ducked) during narration
3. **Enhanced narration prompts** - More engaging, host-like delivery

---

## Implementation Plan

### Phase 1: Podcast-Style UI Redesign

#### 1.1 BlogReadAloud Component Overhaul
Transform the current button-based UI into a podcast player aesthetic:

**Before (Current):**
- Simple button with Volume2 icon
- Basic progress slider when playing

**After (Podcast Style):**
- Album art/thumbnail display (using blog post OGP image)
- Audio waveform visualizer (reuse existing MusicPlayer visualizer logic)
- Episode-style layout with host avatar
- "NOW PLAYING" indicator with animated bars
- Larger, more prominent controls

**Key Visual Elements:**
- Post thumbnail/OGP image as "episode cover"
- Yuki's profile image as host avatar
- Animated equalizer bars during playback
- Gradient background matching site theme

#### 1.2 TTSFloatingPlayer Enhancement
Update the floating player to match podcast aesthetic:
- Add mini album art
- Show "Yuki's Podcast" branding
- More prominent minimize/expand states

---

### Phase 2: Background Music Integration

#### 2.1 Context Enhancement (`TTSPlayerContext.tsx`)
Add background music state management:
```typescript
// New state
bgMusicEnabled: boolean;
bgMusicTrack: string | null;
setBgMusicEnabled: (enabled: boolean) => void;
```

#### 2.2 Background Music Logic
- When TTS starts, optionally auto-start ambient music at 15-20% volume
- Use existing ducking system (already reduces music to 20%)
- Allow user toggle for "BGM on/off"
- Default: OFF (respect user choice, opt-in)

**Recommended ambient tracks from existing library:**
- `musubinaosu-asa.mp3` - Morning ambient vibe
- `shio-to-pixel.mp3` - Electronic/lo-fi suitable

#### 2.3 UI Toggle
Add a small toggle in the podcast player:
- Music note icon with on/off state
- Tooltip: "Background music" / "BGM"

---

### Phase 3: Enhanced Narration Prompts

#### 3.1 Update `blog-tts/index.ts`
Enhance the system prompts to be more podcast-host-like:

**Japanese Additions:**
- Add podcast intro/outro hooks: "それでは、はじめましょう"
- More dramatic pauses for key points
- Natural laugh/reaction cues like "これ、おもしろいですよね"

**English Additions:**
- Opening hook: "Alright, let's dive in..."
- Engagement phrases: "Now here's where it gets really interesting..."
- Sign-off style: "That's a wrap for this one..."

#### 3.2 Voice Settings Optimization
Adjust ElevenLabs parameters for more natural podcast delivery:
- Increase `style` slightly for more expression
- Add slight variance in pacing

---

### Phase 4: Visual Components

#### 4.1 New Components Needed

**PodcastPlayerCard.tsx** (New Component)
```text
+--------------------------------------------------+
|  [OGP Image]  |  NOW PLAYING                     |
|   as cover    |  "Article Title"                 |
|               |  ▶️ Yuki's Blog Podcast          |
|               |  [▓▓▓▓▓▓░░░░░] 4:32 / 12:45     |
+--------------------------------------------------+
| ⏮  ◀10s  ▶/⏸  ▶10s  ⏭  | 1.2x | 🎵 BGM |
+--------------------------------------------------+
```

**AudioVisualizer.tsx** (Reuse from MusicPlayer)
- Extract the visualizer logic from MusicPlayer
- Create reusable component for both music and TTS

#### 4.2 Animation Enhancements
- Pulsing glow around player when active
- Smooth transitions between states
- "Breathing" animation on host avatar

---

## Technical Details

### Files to Create
1. `src/components/PodcastPlayer.tsx` - New podcast-style UI component

### Files to Modify
1. `src/components/BlogReadAloud.tsx` - Replace with podcast UI
2. `src/components/TTSFloatingPlayer.tsx` - Update floating version
3. `src/contexts/TTSPlayerContext.tsx` - Add BGM state
4. `supabase/functions/blog-tts/index.ts` - Enhanced prompts
5. `src/components/MusicPlayer.tsx` - Export visualizer logic

### Existing Systems to Leverage
- **Audio ducking**: Already implemented (music reduces to 20% during TTS)
- **Framer Motion**: For smooth animations
- **ElevenLabs TTS**: Already configured with Yuki's voice
- **Gemini 3**: Already converting to conversational style

---

## Summary of User-Facing Changes

| Feature | Before | After |
|---------|--------|-------|
| **UI Design** | Simple button + slider | Full podcast player with cover art |
| **Visualizer** | 4 tiny pulse bars | Full waveform/equalizer |
| **Host Identity** | "Read by Yuki" text | Avatar + "Yuki's Podcast" branding |
| **Background Music** | None | Optional lo-fi BGM at low volume |
| **Narration Style** | Article reading | Podcast host delivery |
| **Floating Player** | Basic controls | Mini podcast card |

---

## Notes

- Background music is **opt-in** to respect users who prefer narration only
- All animations follow the existing design system (dark theme, glassmorphism)
- The existing audio ducking system seamlessly handles BGM volume
- Cache-busting not required since prompts haven't changed substantially

