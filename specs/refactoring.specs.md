I want you to review the algorithm store. The current code is too large and it's very difficult to read through and reason about. The goal is to simplify the current implementation by splitting into different files and simplifying the logic. I also want to use the State more cleanly. For example, when I'm modifying the state because I'm using immer, I want to modify the state directly and make the code more cleaner. The goal is also to implement testable code so make sure the code can be tested and there are no external dependencies. Before implementing any refractory I want you to plan the refractory and I want to review it before going ahead with the refactoring. 


### 1. File Structure Reorganization
```
src/stores/
├── algorithm/
│   ├── index.ts                 # Main store export
│   ├── types.ts                 # Type definitions
│   ├── slices/
│   │   ├── codeSlice.ts        # Code management logic
│   │   ├── timerSlice.ts       # Timer management logic
│   │   ├── executionSlice.ts   # Code execution logic
│   │   └── submissionSlice.ts  # Submission handling logic
│   ├── selectors.ts            # Pure functions for state selection
│   └── utils/
│       ├── codeUtils.ts        # Code-related utility functions
│       └── timerUtils.ts       # Timer-related utility functions
```

### 2. Key Improvements

1. **State Management**:
   - Split the monolithic state into logical slices
   - Each slice will handle its own actions and state updates
   - Use more immutable patterns and pure functions
   - Clearer separation between state and actions

2. **Types Organization**:
   - Move all types to a dedicated `types.ts`
   - Better type safety and organization
   - Easier to maintain and extend

3. **Code Execution**:
   - Isolate code execution logic
   - Better error handling
   - Cleaner timeout management

4. **Timer Logic**:
   - Separate timer-related state and actions
   - More functional approach to time calculations
   - Better pause/resume management

### 3. Example Structure of Key Components

```typescript
// types.ts
export interface AlgorithmState {
  code: CodeState;
  timer: TimerState;
  execution: ExecutionState;
  submission: SubmissionState;
}

// codeSlice.ts
interface CodeState {
  storedCode: StoredCode;
  activeLanguage: CodeLanguage;
  activeTab: CodeFile;
}

const createCodeSlice = (set: SetState<AlgorithmState>) => ({
  setCode: (code: string) => 
    set(produce((state) => {
      state.code.storedCode[state.code.activeLanguage][state.code.activeTab] = code;
    })),
  // ... other actions
});

// timerSlice.ts
interface TimerState {
  startTime: number | null;
  pausedTime: number | null;
  totalPausedTime: number;
}

const createTimerSlice = (set: SetState<AlgorithmState>) => ({
  startTimer: () => 
    set(produce((state) => {
      state.timer.startTime = Date.now();
      state.timer.pausedTime = null;
    })),
  // ... other actions
});
```

### 4. Benefits

1. **Testability**:
   - Each slice can be tested in isolation
   - Pure functions are easier to test
   - No external dependencies in core logic
   - Clear boundaries between concerns

2. **Maintainability**:
   - Smaller, focused files
   - Clear separation of concerns
   - Better organization of related functionality
   - Easier to understand and modify

3. **Performance**:
   - More efficient state updates
   - Better memoization opportunities
   - Reduced re-renders

4. **Type Safety**:
   - Better type organization
   - Stricter type checking
   - More predictable behavior

### 5. Implementation Strategy

1. Create the new file structure
2. Move types to `types.ts`
3. Implement slices one at a time
4. Add tests for each slice
5. Migrate existing functionality gradually
6. Update components to use new store structure


I'll review your proposed refactoring strategy and suggest some improvements. Let me first examine the current code to provide more specific recommendations.

Read file: src/stores/algorithm.ts


Your proposed refactoring strategy is good, but I have some additional suggestions to improve it further. Here's my enhanced version:

### 1. Enhanced File Structure
```
src/stores/algorithm/
├── index.ts                    # Main store export and store creation
├── types/
│   ├── index.ts               # Re-exports all types
│   ├── state.ts               # State type definitions
│   ├── actions.ts             # Action type definitions
│   └── models.ts              # Domain model type definitions
├── slices/
│   ├── index.ts               # Combines all slices
│   ├── codeSlice.ts           # Code management
│   ├── timerSlice.ts          # Timer management
│   ├── executionSlice.ts      # Code execution
│   ├── submissionSlice.ts     # Submission handling
│   └── algorithmSlice.ts      # Algorithm metadata management
├── selectors/
│   ├── index.ts               # Re-exports all selectors
│   ├── codeSelectors.ts       # Code-related selectors
│   ├── timerSelectors.ts      # Timer-related selectors
│   └── submissionSelectors.ts # Submission-related selectors
└── utils/
    ├── codeUtils.ts           # Code-related utilities
    ├── timerUtils.ts          # Timer calculations
    └── stateUtils.ts          # State manipulation helpers
```

### 2. Key Architectural Improvements

1. **State Design**:
```typescript
// state.ts
export interface AlgorithmState {
  metadata: {
    isLoading: boolean;
    activeAlgorithmId: string | null;
  };
  algorithms: Record<AlgorithmId, AlgorithmData>;
}

export interface AlgorithmData {
  code: CodeState;
  timer: TimerState;
  execution: ExecutionState;
  submission: SubmissionState;
  metadata: AlgorithmMetadataState;
}
```

2. **Slice Pattern**:
```typescript
// slices/codeSlice.ts
export interface CodeState {
  activeLanguage: CodeLanguage;
  activeTab: CodeFile;
  storedCode: StoredCode;
  initialStoredCode: StoredCode;
}

export const createCodeSlice = (
  set: SetState<AlgorithmState>,
  get: GetState<AlgorithmState>
) => ({
  setCode: (algorithmId: string, code: string) =>
    set(produce((state) => {
      const algorithm = state.algorithms[algorithmId];
      if (!algorithm) return;
      
      const { activeLanguage, activeTab } = algorithm.code;
      algorithm.code.storedCode[activeLanguage][activeTab] = code;
    })),
});
```

3. **Pure Selectors**:
```typescript
// selectors/codeSelectors.ts
export const selectActiveCode = (state: AlgorithmState, algorithmId: string) => {
  const algorithm = state.algorithms[algorithmId];
  if (!algorithm) return null;
  
  const { activeLanguage, activeTab, storedCode } = algorithm.code;
  return storedCode[activeLanguage][activeTab];
};
```

### 3. Additional Improvements

1. **Error Handling**:
```typescript
// utils/errorUtils.ts
export class AlgorithmError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
  }
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error as Error);
    }
    throw error;
  }
};
```

2. **Timer Logic Enhancement**:
```typescript
// utils/timerUtils.ts
export const calculateRunningTime = (timerState: TimerState): number => {
  const { initialStartTime, pausedAt, totalPausedTime } = timerState;
  const now = Date.now();
  
  if (pausedAt) {
    return pausedAt - initialStartTime - totalPausedTime;
  }
  
  return now - initialStartTime - totalPausedTime;
};
```

3. **Middleware Integration**:
```typescript
// index.ts
export const useAlgorithmStore = create<AlgorithmState>()(
  persist(
    immer(
      devtools(
        (set, get) => ({
          ...createCodeSlice(set, get),
          ...createTimerSlice(set, get),
          // ... other slices
        }),
        { name: 'Algorithm Store' }
      )
    ),
    {
      name: 'algorithm-store',
      storage: createJSONStorage(() => localStorage),
      partialize: createPartializer(['algorithms']),
    }
  )
);
```

### 4. Testing Strategy

1. **Unit Tests**:
```typescript
// __tests__/slices/codeSlice.test.ts
describe('CodeSlice', () => {
  it('should update code for active language and tab', () => {
    const store = createTestStore();
    const algorithmId = 'test-id';
    const code = 'test code';
    
    store.getState().setCode(algorithmId, code);
    
    expect(selectActiveCode(store.getState(), algorithmId)).toBe(code);
  });
});
```

2. **Integration Tests**:
```typescript
// __tests__/integration/codeExecution.test.ts
describe('Code Execution Flow', () => {
  it('should execute code and update results', async () => {
    const store = createTestStore();
    await store.getState().runCode('test-id');
    
    const results = selectExecutionResults(store.getState(), 'test-id');
    expect(results).toBeDefined();
  });
});
```

### 5. Implementation Plan

1. **Phase 1: Setup (Day 1)**
   - Create new directory structure
   - Set up types and interfaces
   - Configure build and test environment

2. **Phase 2: Core Implementation (Days 2-3)**
   - Implement state slices
   - Add selectors
   - Create utility functions

3. **Phase 3: Testing (Days 4-5)**
   - Write unit tests
   - Add integration tests
   - Performance testing

4. **Phase 4: Migration (Days 6-7)**
   - Gradually migrate existing functionality
   - Update component references
   - Validate functionality

Would you like me to proceed with implementing any specific part of this refactoring plan?


Testing Strategy
Phase 1: Unit Tests for Core Functionality
1. State Utils Tests
Test withAlgorithm helper
Test state validation functions
Test error handling
Selector Tests
Test all code selectors
Test timer selectors
Test execution selectors
Test submission selectors
Test metadata selectors
Slice Tests
Test code slice actions
Test timer slice actions
Test execution slice actions
Test submission slice actions
Phase 2: Integration Tests
Store Initialization
Test algorithm initialization
Test state persistence
Test error handling
Code Management Flow
Test code editing flow
Test language switching
Test file management
Timer Management Flow
Test timer start/pause/resume
Test time calculations
Test timer persistence
Execution Flow
Test code execution
Test timeout handling
Test error scenarios
Submission Flow
Test submission process
Test notes management
Test completion states
Phase 3: Edge Cases and Error Handling
State Edge Cases
Test invalid algorithm IDs
Test missing data scenarios
Test state recovery
Concurrent Operations
Test multiple operations
Test race conditions
Test state consistency
Error Recovery
Test error state handling
Test cleanup procedures
Test state restoration