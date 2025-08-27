# simple-notes-app-12408-12428

This workspace contains a Vite-based frontend container `notes_frontend` implementing a simple notes application.

Features:
- Create, view, edit, delete notes
- Search notes (title and content)
- Sidebar + main editor layout
- Light, modern theme with colors:
  - Primary: #1976d2
  - Secondary: #424242
  - Accent: #e91e63
- LocalStorage persistence (no backend required)

How to run:
- Development: `npm run dev` in `notes_frontend` (served on port 3000)
- Build: `npm run build`
- Preview: `npm run preview`

Structure:
- `src/main.js` — App logic and rendering
- `src/style.css` — Styles and theme
- `index.html` — App container