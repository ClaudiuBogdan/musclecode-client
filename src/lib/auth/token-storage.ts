import { createAuthError } from "./errors";
import { encrypt, decrypt } from "./crypto";
import { AuthErrorCode } from "./errors";

interface TokenData {
  token: string;
  refreshToken: string | null;
  timestamp: number;
}

export class TokenStorage {
  private static readonly TOKEN_KEY = "auth_token";

  static async setToken(token: string, refreshToken?: string): Promise<void> {
    try {
      console.log("[TokenStorage] Storing new token");
      const data: TokenData = {
        token,
        refreshToken: refreshToken ?? null,
        timestamp: Date.now(),
      };

      const encryptedData = await encrypt(JSON.stringify(data));
      localStorage.setItem(this.TOKEN_KEY, encryptedData);
      console.log("[TokenStorage] Token stored successfully");
    } catch (error) {
      console.error("[TokenStorage] Failed to store token:", error);
      throw createAuthError(AuthErrorCode.TOKEN_STORAGE_ERROR);
    }
  }

  static async getToken(): Promise<string | undefined> {
    try {
      console.log("[TokenStorage] Retrieving token");
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);

      if (!encryptedData) {
        console.log("[TokenStorage] No token found in storage");
        return undefined;
      }

      const decryptedData = await decrypt(encryptedData);
      const data: TokenData = JSON.parse(decryptedData);

      console.log("[TokenStorage] Token retrieved successfully");
      return data.token;
    } catch (error) {
      console.error("[TokenStorage] Error retrieving token:", error);
      return undefined;
    }
  }

  static async getRefreshToken(): Promise<string | undefined> {
    try {
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedData) {
        return undefined;
      }

      const decryptedData = await decrypt(encryptedData);
      const data: TokenData = JSON.parse(decryptedData);
      return data.refreshToken ?? undefined;
    } catch (error) {
      console.error("[TokenStorage] Error retrieving refresh token:", error);
      return undefined;
    }
  }

  static removeToken(): void {
    console.log("[TokenStorage] Removing token from storage");
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
