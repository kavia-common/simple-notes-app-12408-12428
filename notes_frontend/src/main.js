/**
 * Simple Notes App - Vite Vanilla JS
 * Features: Create, View, Edit, Delete, Search notes
 * Storage: LocalStorage for persistence
 * Layout: Sidebar (list/search/add) + Main panel (view/edit)
 * Theme: Light, modern, with primary #1976d2, secondary #424242, accent #e91e63
 */

import './style.css'

// Types
/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 */

// PUBLIC_INTERFACE
function generateId() {
  /** Generate a simple unique id based on timestamp and random. */
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const STORAGE_KEY = 'simple-notes-app__notes'
const SELECTED_KEY = 'simple-notes-app__selectedId'

// PUBLIC_INTERFACE
function loadNotes() {
  /** Load notes array from localStorage. Returns Note[]. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Persist notes to localStorage. */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

// PUBLIC_INTERFACE
function loadSelectedId() {
  /** Load previously selected note id. */
  return localStorage.getItem(SELECTED_KEY) || null
}

function saveSelectedId(id) {
  localStorage.setItem(SELECTED_KEY, id || '')
}

// PUBLIC_INTERFACE
function createNote(title = 'Untitled note') {
  /** Create a new note with default content. */
  const now = Date.now()
  return /** @type {Note} */ ({
    id: generateId(),
    title,
    content: '',
    createdAt: now,
    updatedAt: now,
  })
}

// PUBLIC_INTERFACE
function formatDate(ts) {
  /** Format timestamp for display. */
  const d = new Date(ts)
  return d.toLocaleString()
}

// State
let state = {
  notes: loadNotes(),
  selectedId: loadSelectedId(),
  query: '',
  isEditingTitle: false,
}

// DOM root
const app = document.getElementById('app')

// Templates
function renderLayout() {
  if (!app) return
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon">📝</span>
          <span class="brand-text">Simple Notes</span>
        </div>
        <div class="sidebar-actions">
          <button id="addNoteBtn" class="btn primary">
            <span class="btn-icon">＋</span>
            New note
          </button>
        </div>
        <div class="search-wrap">
          <input id="searchInput" class="search-input" type="search" placeholder="Search notes..." value="${escapeHtml(state.query)}" />
        </div>
        <nav id="notesList" class="notes-list">
          ${renderNoteItems()}
        </nav>
      </aside>
      <main class="main">
        ${renderMainPanel()}
      </main>
    </div>
    <footer class="footer">
      <span>Built with Vite • Local only</span>
      <a href="https://vite.dev" target="_blank" rel="noreferrer">Vite</a>
    </footer>
  `
  bindEvents()
}

function renderNoteItems() {
  const filtered = getFilteredNotes()
  if (filtered.length === 0) {
    return `<div class="empty-list">No notes. Create one!</div>`
  }
  return filtered
    .map((n) => {
      const active = n.id === state.selectedId ? ' active' : ''
      const preview = n.content ? escapeHtml(n.content).slice(0, 80) : 'No content yet...'
      return `
        <div class="note-item${active}" data-id="${n.id}">
          <div class="note-item-title">${escapeHtml(n.title || 'Untitled')}</div>
          <div class="note-item-meta">${formatDate(n.updatedAt)}</div>
          <div class="note-item-preview">${preview}</div>
        </div>
      `
    })
    .join('')
}

function renderMainPanel() {
  const note = state.notes.find((n) => n.id === state.selectedId)
  if (!note) {
    return `
      <div class="empty-main">
        <div class="empty-icon">✨</div>
        <h2>Welcome!</h2>
        <p>Select a note from the left, or create a new one.</p>
      </div>
    `
  }

  return `
    <div class="editor">
      <div class="editor-header">
        <input id="titleInput" class="title-input" placeholder="Note title" value="${escapeHtml(
          note.title
        )}" />
        <div class="editor-actions">
          <button id="deleteBtn" class="btn danger outline" title="Delete note">Delete</button>
          <button id="shareBtn" class="btn secondary outline" title="Copy content">Copy</button>
        </div>
      </div>
      <div class="timestamps">
        <span>Created: ${formatDate(note.createdAt)}</span>
        <span>Updated: ${formatDate(note.updatedAt)}</span>
      </div>
      <textarea id="contentInput" class="content-input" placeholder="Start typing...">${escapeHtml(
        note.content
      )}</textarea>
    </div>
  `
}

function getFilteredNotes() {
  const q = state.query.trim().toLowerCase()
  const notes = [...state.notes].sort((a, b) => b.updatedAt - a.updatedAt)
  if (!q) return notes
  return notes.filter((n) => {
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    )
  })
}

function bindEvents() {
  const addNoteBtn = document.getElementById('addNoteBtn')
  const searchInput = document.getElementById('searchInput')
  const notesList = document.getElementById('notesList')
  const titleInput = document.getElementById('titleInput')
  const contentInput = document.getElementById('contentInput')
  const deleteBtn = document.getElementById('deleteBtn')
  const shareBtn = document.getElementById('shareBtn')

  if (addNoteBtn) addNoteBtn.addEventListener('click', handleAddNote)
  if (searchInput)
    searchInput.addEventListener('input', (e) => {
      state.query = e.target.value
      renderLayout()
    })
  if (notesList)
    notesList.addEventListener('click', (e) => {
      const item = e.target.closest('.note-item')
      if (!item) return
      const id = item.getAttribute('data-id')
      selectNote(id)
    })
  if (titleInput)
    titleInput.addEventListener('input', (e) => {
      updateSelectedNote({ title: e.target.value })
    })
  if (contentInput)
    contentInput.addEventListener('input', (e) => {
      updateSelectedNote({ content: e.target.value })
    })
  if (deleteBtn) deleteBtn.addEventListener('click', handleDelete)
  if (shareBtn) shareBtn.addEventListener('click', handleCopy)
}

// Actions
function handleAddNote() {
  const note = createNote()
  state.notes.unshift(note)
  state.selectedId = note.id
  saveNotes(state.notes)
  saveSelectedId(state.selectedId)
  renderLayout()
}

function selectNote(id) {
  state.selectedId = id
  saveSelectedId(id)
  renderLayout()
}

function updateSelectedNote(patch) {
  const idx = state.notes.findIndex((n) => n.id === state.selectedId)
  if (idx === -1) return
  const updated = { ...state.notes[idx], ...patch, updatedAt: Date.now() }
  state.notes.splice(idx, 1, updated)
  saveNotes(state.notes)
  // Avoid re-render loop on each keystroke by throttling updates to sidebar preview
  // but for simplicity here we re-render quickly to keep timestamps/list in sync.
  renderLayout()
}

function handleDelete() {
  const idx = state.notes.findIndex((n) => n.id === state.selectedId)
  if (idx === -1) return
  const title = state.notes[idx].title || 'this note'
  const ok = confirm(`Delete "${title}"? This cannot be undone.`)
  if (!ok) return
  state.notes.splice(idx, 1)
  saveNotes(state.notes)
  if (state.notes.length) {
    state.selectedId = state.notes[0].id
  } else {
    state.selectedId = null
  }
  saveSelectedId(state.selectedId)
  renderLayout()
}

async function handleCopy() {
  const note = state.notes.find((n) => n.id === state.selectedId)
  if (!note) return
  const text = `# ${note.title}\n\n${note.content}`
  try {
    await navigator.clipboard.writeText(text)
    toast('Copied to clipboard')
  } catch {
    toast('Failed to copy')
  }
}

// Helpers
function toast(message) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = message
  document.body.appendChild(el)
  requestAnimationFrame(() => el.classList.add('show'))
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => el.remove(), 300)
  }, 1500)
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Initial selection if none
if (!state.selectedId && state.notes.length) {
  state.selectedId = state.notes[0].id
  saveSelectedId(state.selectedId)
}

// Initial render
renderLayout()
