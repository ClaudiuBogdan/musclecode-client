import { createAuthError } from "./errors";
import { encrypt, decrypt } from "./crypto";
import { AuthErrorCode } from "./errors";

interface TokenData {
  token: string;
  timestamp: number;
}

export class TokenStorage {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly TOKEN_MAX_AGE = 1000 * 60 * 60; // 1 hour

  static async setToken(token: string): Promise<void> {
    try {
      console.log("[TokenStorage] Storing new token");
      const data: TokenData = {
        token,
        timestamp: Date.now(),
      };

      const encryptedData = await encrypt(JSON.stringify(data));
      sessionStorage.setItem(this.TOKEN_KEY, encryptedData);
      console.log("[TokenStorage] Token stored successfully");
    } catch (error) {
      console.error("[TokenStorage] Failed to store token:", error);
      throw createAuthError(AuthErrorCode.TOKEN_STORAGE_ERROR);
    }
  }

  static async getToken(): Promise<string> {
    try {
      console.log("[TokenStorage] Retrieving token");
      const encryptedData = sessionStorage.getItem(this.TOKEN_KEY);

      if (!encryptedData) {
        console.log("[TokenStorage] No token found in storage");
        throw createAuthError(AuthErrorCode.TOKEN_NOT_FOUND);
      }

      const decryptedData = await decrypt(encryptedData);
      const data: TokenData = JSON.parse(decryptedData);

      // Check token age
      if (Date.now() - data.timestamp > this.TOKEN_MAX_AGE) {
        console.log("[TokenStorage] Token has expired");
        this.removeToken();
        throw createAuthError(AuthErrorCode.TOKEN_INVALID);
      }

      console.log("[TokenStorage] Token retrieved successfully");
      return data.token;
    } catch (error) {
      console.error("[TokenStorage] Error retrieving token:", error);
      throw error;
    }
  }

  static removeToken(): void {
    console.log("[TokenStorage] Removing token from storage");
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
