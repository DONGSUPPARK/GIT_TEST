# Memory Match Game

Lightweight vanilla JS memory card game. Pick a difficulty, flip two cards at a time, and clear the board as fast as possible.

## Project Structure

```
├── index.html   # Layout, controls, modal
├── style.css    # Responsive layout, flip animation, color theme
└── script.js    # Shuffle/match logic, timer, hint, best record storage
```

## Running Locally

1. Clone or download the repository.
2. Serve the directory with any static server (e.g., `npx serve`, VSCode Live Server) or simply open `index.html` directly in a browser.
3. Choose a difficulty, press "다시 섞기", then flip cards to find all pairs.

## Testing & Deployment Notes

- **Browser coverage**: try Chrome/Safari/Firefox and mobile browsers to confirm touch + animation performance.
- **Accessibility**: verify keyboard focus, aria labels, and announcement of modal dialogs.
- **Performance**: ensure 6×6 mode still animates smoothly; use emoji assets to keep payload tiny.
- **Deployment**: upload the three static files to GitHub Pages/Netlify/Vercel or any static hosting provider.
