# PXL

> Screenshot. Annotate. Copy. Done.

A minimal, fast screenshot annotation tool for Windows. Capture any region of your screen, annotate it with arrows, text, and highlights — then copy directly to clipboard and paste anywhere.

Built because CleanShot X is Mac-only and Windows deserved something just as clean.

![PXL Demo](./assets/demo.gif)

---

## Features

- **Global hotkey** — `Ctrl + Shift + X` from anywhere
- **Region capture** — drag to select any area of your screen
- **Annotation tools** — arrow, text, highlight
- **5 color presets** — pick your accent instantly
- **Undo** — `Ctrl + Z` to step back
- **Copy & close** — one click copies annotated image to clipboard
- **Paste anywhere** — Slack, Notion, GitHub, email — whatever

---

## Stack

- Electron
- React + Vite
- Canvas API (no external annotation libs)

---

## Getting Started

### Prerequisites

- Node.js v18+
- Git

### Install & run

```bash
git clone https://github.com/tejasz29/pxl.git
cd pxl
npm install
npm run dev
```

Then press `Ctrl + Shift + X` to trigger a capture.

---

## Build `.exe`

```bash
npm run build
```

Output will be in the `dist/` folder as a Windows installer.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + X` | Open capture overlay |
| `Esc` | Cancel / close |
| `Ctrl + Z` | Undo last annotation |
| `Enter` | Commit text (in text tool) |

---


## Why PXL

Most screenshot tools on Windows are either bloated (Snagit), outdated (Greenshot), or require too many clicks. PXL is built for developers and async teams who screenshot constantly and just want to annotate fast and paste.

---

## License

MIT
