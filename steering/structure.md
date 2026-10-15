# Project Structure

```
kiro-todo-v2/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── .oxlintrc.json          # Oxlint rules
├── public/
│   ├── favicon.svg         # App favicon
│   └── icons.svg           # SVG icon sprite
├── scripts/
│   └── patch-rollup.mjs   # Postinstall Rollup patch
├── src/
│   ├── main.jsx            # App bootstrap (theme, providers, auth gate)
│   ├── App.jsx             # Root layout and view routing
│   ├── index.css           # Global CSS reset and base styles
│   ├── assets/             # Static assets (images, etc.)
│   ├── constants/
│   │   └── index.js        # Design tokens, view enums, categories, colors
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── TaskContext.jsx     # Task CRUD and state management
│   │   ├── HabitContext.jsx    # Habit tracking state
│   │   ├── JournalContext.jsx  # Journal entries state
│   │   └── FinanceContext.jsx  # Finance tracking state
│   ├── components/
│   │   ├── LoginScreen.jsx         # Login/auth gate
│   │   ├── Sidebar.jsx             # Desktop navigation sidebar
│   │   ├── MobileNav.jsx           # Mobile bottom navigation
│   │   ├── GlassHeader.jsx         # Page header with title and actions
│   │   ├── Toolbar.jsx             # Filter/search toolbar
│   │   ├── ViewSwitcher.jsx        # View mode toggle
│   │   ├── KanbanBoard.jsx         # Kanban drag-and-drop board
│   │   ├── ListView.jsx            # Task list view
│   │   ├── CalendarView.jsx        # Calendar view
│   │   ├── StatsDashboard.jsx      # Productivity statistics
│   │   ├── HabitView.jsx           # Habit tracker view
│   │   ├── JournalView.jsx         # Journal/diary view
│   │   ├── FinanceView.jsx         # Finance tracker view
│   │   ├── TaskDialog.jsx          # Add/edit task modal
│   │   ├── TaskCard.jsx            # Individual task card
│   │   └── CategoryZoomDialog.jsx  # Category detail dialog
│   └── services/
│       └── storageService.js   # localStorage abstraction layer
└── steering/               # Project documentation
    ├── tech.md
    ├── structure.md
    └── style.md
```

## Architecture Patterns

### State Management

- **React Context API** — Multiple domain-specific contexts (Task, Habit, Journal, Finance, Auth)
- Contexts wrap the entire app tree in `main.jsx`
- Each context manages its own localStorage persistence via `storageService`

### Routing

- No router library — view switching is managed via React state (`currentView`) with a `VIEWS` enum
- Views are conditionally rendered in `App.jsx`

### Responsive Design

- Desktop: Sidebar-based navigation
- Mobile: Bottom navigation bar (`MobileNav`)
- Breakpoint detection via MUI's `useMediaQuery('(min-width:768px)')`

### Data Flow

1. `storageService` reads/writes to localStorage
2. Context providers load initial state from storage and sync changes
3. Components consume context via custom hooks (e.g., `useTaskContext`)
4. User actions dispatch through context functions, which update state and persist
