import { encrypt, decrypt } from "./crypto";
import { createAuthError } from "./errors";
import { AuthErrorCode } from "./errors";
import { createLogger } from "../logger";

interface TokenData {
  token: string;
  refreshToken: string | null;
  timestamp: number;
}

const logger = createLogger("TokenStorage");

export class TokenStorage {
  private static readonly TOKEN_KEY = "auth_token";

  static async setToken(token: string, refreshToken?: string): Promise<void> {
    try {
      logger.verbose("Token Storage Started", {
        hasRefreshToken: !!refreshToken,
      });

      const data: TokenData = {
        token,
        refreshToken: refreshToken ?? null,
        timestamp: Date.now(),
      };

      const encryptedData = await encrypt(JSON.stringify(data));
      localStorage.setItem(this.TOKEN_KEY, encryptedData);
      logger.verbose("Token Storage Completed");
    } catch (error) {
      logger.error(
        "Token Storage Failed",
        error instanceof Error ? error : new Error("Unknown error")
      );
      throw createAuthError(AuthErrorCode.TOKEN_STORAGE_ERROR);
    }
  }

  static async getToken(): Promise<string | undefined> {
    try {
      logger.verbose("Token Retrieval Started");
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);

      if (!encryptedData) {
        logger.verbose("Token Not Found");
        return undefined;
      }

      const decryptedData = await decrypt(encryptedData);
      const data: TokenData = JSON.parse(decryptedData);

      logger.verbose("Token Retrieved Successfully", {
        tokenAge: Date.now() - data.timestamp,
      });
      return data.token;
    } catch (error) {
      logger.error(
        "Token Retrieval Failed",
        error instanceof Error ? error : new Error("Unknown error")
      );
      return undefined;
    }
  }

  static async getRefreshToken(): Promise<string | undefined> {
    try {
      logger.verbose("Refresh Token Retrieval Started");
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);

      if (!encryptedData) {
        logger.verbose("Refresh Token Not Found");
        return undefined;
      }

      const decryptedData = await decrypt(encryptedData);
      const data: TokenData = JSON.parse(decryptedData);

      logger.verbose("Refresh Token Retrieved", {
        hasRefreshToken: !!data.refreshToken,
      });
      return data.refreshToken ?? undefined;
    } catch (error) {
      logger.error(
        "Refresh Token Retrieval Failed",
        error instanceof Error ? error : new Error("Unknown error")
      );
      return undefined;
    }
  }

  static removeToken(): void {
    logger.verbose("Token Removal Started");
    localStorage.removeItem(this.TOKEN_KEY);
    logger.verbose("Token Removal Completed");
  }
}
