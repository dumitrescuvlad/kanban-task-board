# Kanban Board

A simple, Trello-style Kanban board built with Vue 3, TypeScript, and Pinia.

## Features

- **Drag & Drop** - Move cards between columns or reorder columns
- **Card Details** - Add descriptions, labels, due dates, and importance levels
- **Search & Filter** - Find cards by text or filter by label
- **Undo** - Ctrl/Cmd+Z to undo actions
- **Persistent Storage** - Board state saves to localStorage automatically

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **Pinia** - State management
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/                    # App shell and layout
├── features/kanban/        # Kanban feature module
│   ├── components/         # Board, Column, Card components
│   ├── composables/        # Reusable logic
│   ├── stores/             # Pinia stores
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── shared/                 # Shared components (Button, Input, Modal, etc.)
└── styles/                 # Global CSS
```

## License

MIT
