# 🐼 SaveLives AI Hackathon — Beat the Panda

> **Rock-Paper-Scissors against the IEEE EPI SB panda mascot.**  
> Win → unlock the registration button. Lose → try again!

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🎮 Rock-Paper-Scissors | Real-time hand gesture recognition via **MediaPipe Hands** |
| 📸 Camera feed | Mirrored live feed inside a glassmorphism card + skeleton overlay |
| 🐼 Animated panda | 6 emotion states: idle · thinking · happy · sad · excited · neutral |
| 🔊 Sound effects | Web Audio API — countdown beeps, win fanfare, lose wah-wah |
| 🌌 Particle background | Canvas-based particles with connecting lines |
| 📊 Scoreboard | Win / Draw / Loss counter per session |
| 📱 Responsive | Works on mobile (limited by camera landscape) |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js ≥ 18**
- A browser with **camera access** (Chrome/Edge recommended for MediaPipe)

### 2. Install

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.  
**Allow camera access** when prompted.

### 4. Build for production

```bash
npm run build
npm run preview     # preview the production build locally
```

---

## 🖐️ Gesture Guide

| Gesture | How to show it |
|---|---|
| ✊ **Rock** | Make a fist — all fingers curled in |
| ✋ **Paper** | Open flat hand — all fingers extended |
| ✌️ **Scissors** | Index + middle finger extended, rest curled |

> **Tips for best detection:**
> - Use a well-lit environment
> - Hold your hand ~30–60 cm from the camera
> - Keep background as plain/dark as possible

---

## 🔗 Registration Link Setup

In `src/App.jsx`, find this line and replace the URL:

```jsx
window.open('https://forms.gle/YOUR_REGISTRATION_LINK', '_blank', 'noopener')
```

---

## 🗂️ Project Structure

```
saveliveshackathon/
├── public/
│   └── panda.png               # Transparent-background mascot
├── src/
│   ├── App.jsx                 # Game orchestration + state machine
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles, glassmorphism, utilities
│   └── components/
│       ├── ParticleBackground.jsx  # Canvas particle field
│       ├── PandaCharacter.jsx      # Panda with emotion animations
│       ├── CameraFeed.jsx          # Webcam + MediaPipe hand tracking
│       ├── ResultOverlay.jsx       # Win / Lose / Draw card
│       └── AudioManager.js         # Web Audio API sound effects
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🧠 Technical Notes

### Gesture Detection Logic (`CameraFeed.jsx`)
MediaPipe Hands returns 21 3D landmarks per hand. We classify using:
- **Rock**: 0 fingers with tip above PIP joint (all curled)
- **Paper**: ≥3 fingers extended
- **Scissors**: Only index + middle extended

### Game Decision Logic (`App.jsx`)
Standard RPS: `calcResult(player, panda)` — the panda chooses randomly each round.

### Performance
- MediaPipe models load from jsDelivr CDN (no local WASM bundling needed)
- Canvas skeleton is drawn at full video resolution
- `requestAnimationFrame` loop — auto-throttles to display refresh rate

---

## 🛠️ Tech Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3**
- **Framer Motion 11**
- **MediaPipe Hands 0.4**
- **Web Audio API** (built-in browser)

---

*Made with 🐼 + ❤️ for IEEE EPI SB*
