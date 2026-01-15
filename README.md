# Kanban Task Board

![Vue](https://img.shields.io/badge/Vue%203-35495E?logo=vue.js&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=111827)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-0EA5E9?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-success)

> A lightweight, Trello-style Kanban board built with Vue 3 + TypeScript, featuring a clean UI, smooth drag & drop, and persistent local storage.

---

## Application Overview

This project provides a simple Kanban workflow to organize tasks into columns, move cards with drag & drop, and keep state persisted between sessions.

### What you can do

- Drag & Drop: Move cards between columns and reorder columns
- Card Details: Description, labels, due dates, priority/importance
- Search & Filter: Search by text and filter by label
- Undo: Ctrl/Cmd + Z
- Persistence: Auto-save board state to localStorage

---

## Tech Stack

### Frontend

- Vue 3 (Composition API with `<script setup>`)
- TypeScript
- Pinia (state management)
- Tailwind CSS v4
- Vite

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm (or yarn/pnpm)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```
