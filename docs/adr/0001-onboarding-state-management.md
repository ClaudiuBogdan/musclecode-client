# ADR 0001: Onboarding State Management with Zustand

## Date: 2023-08-22

## Status

Accepted

## Context

The onboarding flow in our application was previously managed using React Query for data fetching and client-side state management. This approach presented several challenges:

1. Limited support for offline scenarios
2. No built-in mechanism for handling network failures
3. Lack of persistent state between sessions
4. Complex coordination between API calls and UI state

We needed a more robust solution that could handle network failures gracefully while providing a smoother user experience during the onboarding process.

## Decision

We decided to refactor the onboarding state management from React Query to Zustand, a lightweight state management library with built-in persistence capabilities.

Key aspects of the implementation:

1. **Direct Store Access**: Use Zustand store directly in components without intermediate hooks
2. **Simplified API**: Consolidate multiple API calls into a single unified method
3. **Error Handling**: Implement a retry mechanism for failed API calls
4. **Network Status Monitoring**: Add automatic retry when network connection is restored
5. **User Feedback**: Provide clear error messages and retry options to users

## Implementation Details

1. **Unified API**: Consolidated multiple API methods into a single `saveStep` method with a type parameter
2. **Retry Logic**: Implemented exponential backoff for retrying failed API calls
3. **Network Detection**: Added event listeners for `online`/`offline` events
4. **Error State**: Dedicated UI for error scenarios with retry options
5. **Separation of Concerns**: Clear distinction between API logic and UI state

## Benefits

1. **Simplified Code**: Reduced boilerplate by accessing the store directly
2. **Improved Reliability**: Better handling of network failures
3. **Enhanced User Experience**: Consistent UI state and clear error feedback
4. **Developer Experience**: Simplified debugging and state inspection
5. **Performance**: Reduced unnecessary API calls and re-renders

## Alternatives Considered

1. **Redux**: Would introduce more boilerplate and complexity
2. **Context API**: Lacks built-in persistence capabilities
3. **Local Storage Only**: Would require custom synchronization logic
4. **Optimistic Updates**: Considered but rejected due to dependency on server-side processing for algorithm suggestions
5. **Custom Hook Layer**: Initially implemented but removed to simplify the architecture

## Consequences

### Positive

- More robust error handling
- Clearer separation of concerns
- Better user experience during network issues
- Simplified component implementation
- Reduced code complexity

### Negative

- Learning curve for developers unfamiliar with Zustand
- Potential for state synchronization issues between local and server data
- Components have direct dependency on store implementation

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Handling Offline in Web Applications](https://web.dev/offline-cookbook/) 