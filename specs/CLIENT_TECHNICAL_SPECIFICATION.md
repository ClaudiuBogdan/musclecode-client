# Client Application Technical Specification

## Architecture Overview

### Core Technologies

- **Framework**: React 18
- **UI**: Shadcn
- **Package Manager**: yarn
- **Routing**: @tanstack/react-router
- **Language**: TypeScript
- **State Management**: TanStack Query (server state) & Zustand (client state)
- **Styling**: Tailwind CSS with CSS Modules
- **Testing**: Vitest, React Testing Library, MSW (API Mocking)

## Application Structure

### Directory Organization

```typescript
src/
├── routes/                 # TanStack Router routes
├── components/
│   ├── common/            # Shared components
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
├── hooks/                 # Custom React hooks
├── lib/                   # Shared utilities
├── services/              # API and external services
│   └── mocks/            # MSW handlers and mocks
├── stores/                # State management
└── types/                 # TypeScript definitions
```

### Core Features Implementation

#### 1. Code Editor Module

```typescript
// components/features/editor/CodeEditor.tsx
interface CodeEditorProps {
  initialCode: string;
  language: ProgrammingLanguage;
  onChange: (code: string) => void;
  onSubmit: () => void;
}

// Using Monaco Editor with custom extensions
const CodeEditor: React.FC<CodeEditorProps> = () => {
  // Implementation details
};
```

#### 2. Algorithm Visualization

```typescript
// components/features/visualization/AlgorithmVisualizer.tsx
interface VisualizerProps {
  algorithm: Algorithm;
  data: VisualizationData;
  speed: AnimationSpeed;
}
```

#### 3. Learning Path Dashboard

```typescript
// components/features/dashboard/LearningPath.tsx
interface LearningPathProps {
  userId: string;
  progress: ProgressData;
  recommendations: Algorithm[];
}
```

## State Management

### Server State (React Query)

```typescript
// services/queries/useAlgorithms.ts
export const useAlgorithms = () => {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: fetchAlgorithms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Client State (Zustand)

```typescript
// stores/editorStore.ts
interface EditorStore {
  code: string;
  language: ProgrammingLanguage;
  theme: EditorTheme;
  setCode: (code: string) => void;
  setLanguage: (lang: ProgrammingLanguage) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  code: "",
  language: "javascript",
  theme: "vs-dark",
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
}));
```

## API Integration

### API Client

```typescript
// services/api/client.ts
import { createClient } from "@tanstack/react-query";

export const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Interceptors and error handling
};
```

### WebSocket Integration

```typescript
// services/websocket/codeExecution.ts
export class CodeExecutionSocket {
  private socket: WebSocket;

  constructor(sessionId: string) {
    this.socket = new WebSocket(`${WS_URL}/code-execution/${sessionId}`);
    this.setupListeners();
  }

  // Implementation details
}
```

## Performance Optimizations

### Code Splitting

```typescript
// app/algorithms/[id]/page.tsx
const AlgorithmVisualizer = dynamic(
  () => import("@/components/features/visualization/AlgorithmVisualizer"),
  {
    loading: () => <VisualizerSkeleton />,
    ssr: false,
  }
);
```

## Testing Strategy

### Unit Tests

```typescript
// components/features/editor/__tests__/CodeEditor.test.tsx
describe("CodeEditor", () => {
  it("should update code content when user types", () => {
    // Test implementation
  });

  it("should highlight syntax errors", () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// tests/integration/algorithm-solving.spec.ts
describe("Algorithm Solving Flow", () => {
  test("user can submit solution and receive feedback", async () => {
    // Test implementation
  });
});
```

## Accessibility

### Implementation Guidelines

- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance

```typescript
// components/common/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  isLoading,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={cn(buttonVariants[variant])}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

## Error Handling

### Error Boundary

```typescript
// components/common/ErrorBoundary.tsx
// TODO: Implement ErrorBoundary
```

## Security Measures

### Authentication Flow

```typescript
// lib/auth/authProvider.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // JWT handling
  // Session management
  // Refresh token logic
};
```

## Build & Deployment

### Environment Configuration

```typescript
// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_WS_URL: string;
    NEXT_PUBLIC_SENTRY_DSN: string;
    // Other environment variables
  }
}
```

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export const performanceMonitor = {
  trackPageLoad: () => {
    // Implementation details
  },
  trackInteraction: (name: string, duration: number) => {
    // Implementation details
  },
};
```

## Router Configuration

### Directory Structure

```typescript
src/
├── routes/                    # TanStack Router routes
│   ├── __root.tsx            # Root layout route
│   ├── index.lazy.tsx        # Home page route
│   ├── algorithms/
│   │   ├── index.lazy.tsx    # Algorithms list page
│   │   └── $id.lazy.tsx      # Algorithm detail page
│   └── auth/
│       ├── login.lazy.tsx    # Login page
│       └── register.lazy.tsx # Register page
```

### Route Implementation Examples

```typescript:src/routes/__root.tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/algorithms">Algorithms</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </>
  ),
})
```

```typescript:src/routes/algorithms/index.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import { useAlgorithms } from '@/services/queries/useAlgorithms'

export const Route = createLazyFileRoute('/algorithms/')({
  component: AlgorithmsPage,
})

function AlgorithmsPage() {
  const { data: algorithms } = useAlgorithms()
  return (
    <div>
      <h1>Algorithms</h1>
      {/* Algorithm list implementation */}
    </div>
  )
}
```

```typescript:src/routes/algorithms/$id.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/algorithms/$id')({
  loader: async ({ params: { id } }) => {
    // Fetch algorithm details
    return { algorithm: await fetchAlgorithm(id) }
  },
  component: AlgorithmDetailPage,
})

function AlgorithmDetailPage() {
  const { algorithm } = Route.useLoaderData()
  return (
    <div>
      <h1>{algorithm.title}</h1>
      {/* Algorithm detail implementation */}
    </div>
  )
}
```

### Router Setup

```typescript:src/main.tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // Auto-generated by TanStack Router

// Create router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent' // Preload routes on hover/focus
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

### Vite Configuration

```typescript:vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
})
```

## API Mocking

```typescript:src/services/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json()
    // Mock authentication logic
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { id: '1', username }
    })
  }),

  // Algorithm handlers
  http.get('/api/algorithms', () => {
    return HttpResponse.json([
      { id: '1', title: 'Binary Search', difficulty: 'medium' },
      // ... more algorithms
    ])
  }),

  // WebSocket mock (if needed)
  http.get('/ws', () => {
    return HttpResponse.json({ success: true })
  })
]
```

## Development Setup

```typescript:src/main.tsx
import { worker } from './services/mocks/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Initialize MSW in development
if (process.env.NODE_ENV === 'development') {
  worker.start()
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}
```
