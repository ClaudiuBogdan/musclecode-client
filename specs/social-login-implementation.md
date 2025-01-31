# Social Login Implementation with Keycloak

Version/Date: v1.0 - 2024-03-19

## Action
Created (New Feature)

## Business Logic / Feature Description
- Enables users to authenticate using social identity providers (Google, GitHub, etc.)
- Integrates with existing Keycloak authentication flow
- Provides seamless social login experience while maintaining existing email/password login

## Edge Cases
- User denies social provider permissions
- Social provider account with no email
- Email already exists in system with different auth method
- Social provider downtime
- Token refresh for social providers
- Account linking/unlinking scenarios

## Why (Justification / Rationale)
- Simplifies user onboarding process
- Reduces friction in authentication flow
- Increases user conversion rate
- Provides more secure authentication options
- Aligns with modern authentication practices

## How (Implementation Strategy)

### 1. Keycloak Configuration

#### 1.1 Enable Identity Providers in Keycloak Admin Console
1. Log into Keycloak Admin Console
2. Navigate to your realm
3. Go to "Identity Providers" section
4. Add desired providers:
   - Google
   - GitHub
   - Microsoft
   - Others as needed

#### 1.2 Configure Each Provider
##### Google Setup
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
   - Authorized redirect URI: `{keycloak-domain}/auth/realms/{realm-name}/broker/google/endpoint`
4. In Keycloak, configure Google IDP:
   - Client ID from Google
   - Client Secret from Google
   - Default Scopes: `openid profile email`

##### GitHub Setup
1. Register new OAuth application in GitHub
2. Set callback URL: `{keycloak-domain}/auth/realms/{realm-name}/broker/github/endpoint`
3. In Keycloak, configure GitHub IDP:
   - Client ID from GitHub
   - Client Secret from GitHub
   - Default Scopes: `user:email`

### 2. Frontend Implementation

#### 2.1 Update Keycloak Configuration
```typescript
// src/config/auth.ts
export const authConfig = {
  keycloak: {
    // ... existing config
    initOptions: {
      pkceMethod: 'S256',
      enableLogging: env.DEV,
      idpHint: '', // Will be used for direct social login
    }
  }
};
```

#### 2.2 Enhance Auth Service
```typescript
// src/lib/auth/keycloak-auth-service.ts
export class KeycloakAuthService {
  async loginWithProvider(provider: 'google' | 'github'): Promise<void> {
    try {
      await this.keycloak.login({
        idpHint: provider
      });
    } catch {
      throw createAuthError(AuthErrorCode.SOCIAL_LOGIN_FAILED);
    }
  }
}
```

#### 2.3 Update UI Components
- Add social login buttons to login page
- Implement loading states
- Handle error states
- Add provider icons and styling

### 3. Error Handling
- Update error codes:
```typescript
// src/lib/auth/errors.ts
export enum AuthErrorCode {
  // ... existing codes
  SOCIAL_LOGIN_FAILED = 'SOCIAL_LOGIN_FAILED',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  ACCOUNT_LINKING_FAILED = 'ACCOUNT_LINKING_FAILED'
}
```

## Additional Notes / References

### Security Considerations
- Implement CSRF protection
- Enable SSL/TLS
- Configure allowed domains
- Set appropriate token lifetimes
- Configure user attribute mapping

### Testing Requirements
- Test with MSW for mocking social provider responses
- Unit tests for new auth service methods
- Integration tests for login flows
- E2E tests for complete social login journey

### Future Enhancements
1. Account linking functionality
2. Provider-specific profile data sync
3. Custom social login buttons styling
4. Social login analytics tracking
5. Multiple social accounts linking

### Related Specifications
- User Profile Management
- Authentication Flow
- Session Management

### Core Technologies Used
- React 18.3 for UI components
- TanStack Query for server state management
- Zustand for client-side auth state
- TypeScript 5.6 for type safety
- Tailwind CSS for styling social buttons
- MSW for testing social login flows 