import { env } from "@/config/env";
import { AuthErrorCode, createAuthError } from "./errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "Crypto" });

// We'll use AES-GCM for encryption with a 256-bit key
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// Generate a key from a password using PBKDF2
async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Generate key material from password
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive the actual key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(data: string): Promise<string> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Use a constant password in development
    // In production, this should be an environment variable
    const password = env.VITE_ENCRYPTION_KEY;

    // Get encryption key
    const key = await getKey(password, salt);

    // Encrypt the data
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      encodedData
    );

    // Combine salt, IV, and encrypted data into a single array
    const result = new Uint8Array(
      salt.length + iv.length + encryptedData.byteLength
    );
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    logger.error("Encryption Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw createAuthError(AuthErrorCode.TOKEN_STORAGE_ERROR);
  }
}

export async function decrypt(encryptedData: string): Promise<string> {
  try {
    // Convert from base64
    const data = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    // Extract salt, IV, and encrypted data
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = data.slice(SALT_LENGTH + IV_LENGTH);

    // Use the same password as encryption
    const password = env.VITE_ENCRYPTION_KEY || "development-key-only";

    // Get decryption key
    const key = await getKey(password, salt);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      encrypted
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    logger.error("Decryption Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw createAuthError(AuthErrorCode.TOKEN_STORAGE_ERROR);
  }
}
