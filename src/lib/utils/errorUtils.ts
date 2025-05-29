import { AuthError, AuthErrorCode } from "@/lib/auth/errors";
import { AppError } from "@/lib/errors/types";

/**
 * Checks if an error is a permission/authorization error (403)
 */
export function isPermissionError(error: unknown): boolean {
  // Check if it's an AuthError with insufficient permissions
  if (error instanceof AuthError) {
    return error.code === AuthErrorCode.INSUFFICIENT_PERMISSIONS;
  }
  
  // Check if it's an AppError with auth type and permission-related code
  if (error instanceof AppError) {
    return error.type === "auth" && error.code === (AuthErrorCode.INSUFFICIENT_PERMISSIONS as string);
  }
  
  // Check if it's a generic error with permission-related message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("permission") || 
           message.includes("forbidden") || 
           message.includes("unauthorized") ||
           message.includes("403");
  }
  
  return false;
}

/**
 * Gets a user-friendly permission error message
 */
export function getPermissionErrorMessage(): string {
  return "You don't have permission to access this content. Please contact your administrator or check your account permissions.";
}

/**
 * Checks if an error is a session/authentication error that requires login
 */
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return [
      AuthErrorCode.SESSION_EXPIRED,
      AuthErrorCode.INVALID_SESSION,
      AuthErrorCode.TOKEN_EXPIRED,
      AuthErrorCode.TOKEN_INVALID,
      AuthErrorCode.TOKEN_NOT_FOUND,
      AuthErrorCode.UNAUTHORIZED,
    ].includes(error.code);
  }
  
  return false;
} 