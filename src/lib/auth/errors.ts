export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode
  ) {
    super(message);
    this.name = "AuthError";
  }

  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }
}

export enum AuthErrorCode {
  // Session errors
  SESSION_EXPIRED = "auth/session-expired",
  INVALID_SESSION = "auth/invalid-session",

  // Token errors
  TOKEN_EXPIRED = "auth/token-expired",
  TOKEN_INVALID = "auth/token-invalid",
  TOKEN_NOT_FOUND = "auth/token-not-found",
  TOKEN_STORAGE_ERROR = "auth/token-storage-error",

  // Permission errors
  INSUFFICIENT_PERMISSIONS = "auth/insufficient-permissions",
  UNAUTHORIZED = "auth/unauthorized",

  // Initialization errors
  INIT_FAILED = "auth/init-failed",
  CONFIG_ERROR = "auth/config-error",

  // Network errors
  NETWORK_ERROR = "auth/network-error",
  SERVER_ERROR = "auth/server-error",

  // Unknown error
  UNKNOWN = "auth/unknown",
}

export function isAuthErrorRequiringLogout(error: Error): boolean {
  if (!AuthError.isAuthError(error)) return false;

  const logoutErrors = [
    AuthErrorCode.SESSION_EXPIRED,
    AuthErrorCode.INVALID_SESSION,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    AuthErrorCode.TOKEN_NOT_FOUND,
    AuthErrorCode.UNAUTHORIZED,
  ];

  return logoutErrors.includes(error.code);
}

export function createAuthError(
  code: AuthErrorCode,
  message?: string
): AuthError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    [AuthErrorCode.SESSION_EXPIRED]:
      "Your session has expired. Please log in again.",
    [AuthErrorCode.INVALID_SESSION]: "Invalid session. Please log in again.",
    [AuthErrorCode.TOKEN_EXPIRED]: "Your authentication token has expired.",
    [AuthErrorCode.TOKEN_INVALID]: "Invalid authentication token.",
    [AuthErrorCode.TOKEN_NOT_FOUND]: "Authentication token not found.",
    [AuthErrorCode.TOKEN_STORAGE_ERROR]:
      "Failed to store authentication token.",
    [AuthErrorCode.INSUFFICIENT_PERMISSIONS]:
      "You do not have permission to perform this action.",
    [AuthErrorCode.UNAUTHORIZED]:
      "You are not authorized to access this resource.",
    [AuthErrorCode.INIT_FAILED]: "Failed to initialize authentication.",
    [AuthErrorCode.CONFIG_ERROR]: "Authentication configuration error.",
    [AuthErrorCode.NETWORK_ERROR]:
      "Network error occurred during authentication.",
    [AuthErrorCode.SERVER_ERROR]:
      "Server error occurred during authentication.",
    [AuthErrorCode.UNKNOWN]: "An unknown authentication error occurred.",
  };

  return new AuthError(message || defaultMessages[code], code);
}
