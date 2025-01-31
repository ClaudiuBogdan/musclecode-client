# Environment Variables Configuration

Version/Date: v1.0 - 2024-03-20

## Action
Created

## Business Logic / Feature Description
- Configures environment variables for Vercel deployment
- Ensures secure handling of sensitive configuration
- Manages different environments (development, production)
- Provides type-safe configuration access throughout the application

## Edge Cases
1. Missing environment variables
   - Impact: Application startup failure
   - Mitigation: Strict validation at startup with clear error messages

2. Invalid URL formats
   - Impact: API/Auth service connection failures
   - Mitigation: URL format validation via Zod schema

3. Development vs Production differences
   - Impact: Different behavior between environments
   - Mitigation: Environment-specific configuration handling

4. Local development overrides
   - Impact: Developer-specific settings conflicts
   - Mitigation: Support for .env.local with documentation

## Why (Justification / Rationale)
- Enable secure deployment to Vercel platform
- Maintain separation of concerns between environments
- Protect sensitive credentials and API keys
- Ensure proper configuration validation
- Provide type safety for configuration values

## How (Implementation Strategy)

### Environment Variables Structure

1. API Configuration:
```env
VITE_OPENAI_API_URL=https://api.example.com/v1
VITE_OPENAI_API_KEY=sk-xxxxx
VITE_OPENAI_MODEL=model-name
VITE_API_URL=https://api.example.com
VITE_EXECUTION_API_URL=https://execution.example.com
```

2. Authentication Configuration:
```env
VITE_ENCRYPTION_KEY=your-secure-key
VITE_KEYCLOAK_URL=https://auth.example.com
VITE_KEYCLOAK_REALM=realm-name
VITE_KEYCLOAK_CLIENT_ID=client-id
VITE_AUTH_ENABLED=true
```

### Implementation Details

1. Configuration Access
   - Use `env` for accessing environment variables
   - Never access process.env directly in the frontend code
   - All configuration should go through typed configuration modules

2. Validation
   - Use Zod schemas for runtime validation
   - Validate all configuration at application startup
   - Provide clear error messages for missing/invalid values

3. Type Safety
   - Generate TypeScript types from Zod schemas
   - Use strict type checking for configuration values
   - Maintain single source of truth for configuration types

### Vercel Deployment Configuration

1. Environment Setup
   - Add all variables in Vercel project settings
   - Use encrypted variables for sensitive data
   - Configure Preview and Production environments separately

2. Build Process
   - Verify environment variables during build
   - Fail build if required variables are missing
   - Log non-sensitive configuration for debugging

3. Runtime Validation
   - Validate configuration on application startup
   - Provide clear error messages to users
   - Log configuration issues to monitoring system

## Additional Notes / References

### Security Guidelines
1. Sensitive Data
   - Use Vercel's encrypted environment variables
   - Never log sensitive values
   - Rotate keys regularly

2. Access Control
   - Limit environment variable access to necessary team members
   - Document who has access to what
   - Regular access audits

### Development Workflow
1. Local Development
   - Use .env.local for personal overrides
   - Keep .env.example updated
   - Document new variables

2. CI/CD
   - Validate environment variables in CI
   - Use different values per environment
   - Maintain deployment documentation

### Related Files
- src/config/env.ts - Main configuration validation
- src/config/auth.ts - Authentication configuration
- .env.example - Example configuration file
- README.md - Setup documentation

### Future Considerations
1. Short term
   - Add configuration validation in CI/CD
   - Implement automatic key rotation
   - Enhance error reporting

2. Long term
   - Configuration versioning
   - Dynamic configuration updates
   - Enhanced security measures 