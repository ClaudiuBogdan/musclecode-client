# Learning API Services

This directory contains the API services and React Query hooks for the learning module functionality.

## Users API

The users API provides functionality to track and monitor user progress through learning modules.

### API Endpoints

- `GET /api/v1/learning/modules/{moduleId}/users` - Get all users in a module with their progress
- `GET /api/v1/learning/modules/{moduleId}/users/{userId}` - Get detailed progress for a specific user

### React Query Hooks

#### `useModuleUsers(moduleId: string)`
Fetches all users enrolled in a learning module with their progress data.

```typescript
const { data, isLoading, error } = useModuleUsers(moduleId);
```

Returns:
- `data.users` - Array of user progress objects
- `data.totalUsers` - Total number of enrolled users
- `data.activeUsers` - Number of currently active users
- `data.completedUsers` - Number of users who completed the module
- `data.strugglingUsers` - Number of users who are struggling

#### `useUserDetail(moduleId: string, userId: string)`
Fetches detailed progress information for a specific user in a module.

```typescript
const { data: user, isLoading, error } = useUserDetail(moduleId, userId);
```

Returns detailed user progress including:
- Basic user information
- Overall progress and scores
- Lesson-by-lesson breakdown
- Question answers and feedback
- Struggling areas and strengths
- Recommended actions

#### `useUserProgressSummary(moduleId: string)`
Provides computed statistics and summary data for all users in a module.

```typescript
const { data, isLoading, error, summary } = useUserProgressSummary(moduleId);
```

The `summary` object includes:
- Progress distribution (beginner/intermediate/advanced)
- Engagement statistics
- Average scores and time spent
- User categorization

### Switching Between Mock and Real API

To switch from mock data to real API calls:

1. Open `src/services/learning/api.ts`
2. Change the `USE_MOCKS` constant from `true` to `false`:

```typescript
// Flag to switch between mock and real API calls
const USE_MOCKS = false; // Change this to false for real API
```

### Mock Data

Mock data is provided in `src/lib/mocks/api/users/index.ts` and includes:
- 5 sample users with different progress levels
- Realistic lesson progress data
- Question answers with feedback
- User engagement metrics

### Data Types

All TypeScript interfaces are defined in `src/services/learning/api.ts`:
- `UserProgress` - Basic user progress information
- `UserDetailResponse` - Extended user details for individual views
- `LessonProgress` - Progress data for individual lessons
- `QuestionAnswer` - Individual question responses with feedback
- `ModuleUsersResponse` - Response format for module users endpoint

### Components Using the API

- `UserProgressTracker` - Overview of all users in a module
- `UserDetailedProgress` - Detailed view of individual user progress

Both components include loading states, error handling, and real-time data updates through React Query. 