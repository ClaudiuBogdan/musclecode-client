# Client Application Technical Specification

## Architecture Overview

### Core Technologies

- **Framework**: React 18.3
- **Build Tool**: Vite 5
- **UI**: Shadcn/ui with Radix UI primitives
- **Package Manager**: yarn
- **Routing**: @tanstack/react-router
- **Language**: TypeScript 5.6
- **State Management**: TanStack Query (server state) & Zustand (client state)
- **Code Editor**: CodeMirror 6
- **Styling**: Tailwind CSS with CSS Modules
- **Testing**: MSW for API Mocking
- **Charts**: Recharts
- **Date Handling**: date-fns
- **State Updates**: Immer

## Application Structure

### Directory Organization

```typescript
src/
├── routes/                 # TanStack Router routes
│   ├── __root.tsx         # Root layout
│   ├── index.lazy.tsx     # Home page
│   └── algorithm.$id.lazy.tsx # Algorithm detail page
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── code/            # Code editor related components
│   ├── sidebar/         # Sidebar components
│   ├── quiz/            # Quiz related components
│   ├── algorithms/      # Algorithm specific components
│   ├── training/        # Training related components
│   └── theme/           # Theme related components
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── services/             # API and external services
├── types/                # TypeScript definitions
├── lib/                  # Shared utilities
├── utils/               # Utility functions
└── assets/              # Static assets
```

### Core Features

#### 1. Code Editor Integration

The application uses CodeMirror 6 with support for multiple languages:
- JavaScript/TypeScript
- Python
- Markdown

```typescript
// Key CodeMirror extensions used
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { markdown } from "@codemirror/lang-markdown"
```

#### 2. UI Components

The application uses a comprehensive set of Radix UI primitives:
- Accordion
- Avatar
- Dialog
- Dropdown Menu
- Popover
- Progress
- Tabs
- Tooltip

#### 3. State Management

```typescript
// Example store structure
interface Store {
  // State definition
  state: State;
  // Actions
  actions: Actions;
}

// Using Zustand with Immer for immutable updates
import { create } from 'zustand';
import { produce } from 'immer';
```

### Routing

The application uses TanStack Router with lazy-loaded routes:
- Root layout (`__root.tsx`)
- Home page (`index.lazy.tsx`)
- Algorithm detail page (`algorithm.$id.lazy.tsx`)

### Development Tools

- ESLint with TypeScript support
- SWC for fast compilation
- MSW for API mocking
- Faker.js for generating test data
- TanStack Router DevTools

### Styling

- Tailwind CSS with PostCSS
- CSS Modules support
- Typography plugin
- Animation utilities
- Class variance authority for component variants

### Performance Optimizations

- Route-based code splitting
- Lazy loading of components
- SWC-based compilation
- Vite for fast development and optimized builds

### Testing Strategy

MSW (Mock Service Worker) is used for API mocking:
```typescript
// MSW configuration
{
  "msw": {
    "workerDirectory": [
      "public"
    ]
  }
}
```

### Build & Deployment

```bash
# Development
yarn dev

# Production build
yarn build

# Type checking
tsc -b

# Linting
yarn lint
```

## Browser Support

The application targets modern browsers with ES Module support, leveraging Vite's build optimization features.

## Security Considerations

- All dependencies are managed through yarn with lockfile
- TypeScript for type safety
- ESLint for code quality and security rules
- Environment-based configuration
