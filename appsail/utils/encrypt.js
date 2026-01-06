import crypto from "crypto";
import { ENV } from "../config/env.js";

const ALGO = "aes-256-gcm";

export function encrypt(text) {
  if (!ENV.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY not configured");
  }

  // Use ENCRYPTION_KEY directly as a 32-byte key, or derive it
  let key;
  if (ENV.ENCRYPTION_KEY.length === 64) {
    // If it's already a hex string of 32 bytes
    key = Buffer.from(ENV.ENCRYPTION_KEY, "hex");
  } else {
    // Derive a 32-byte key from the string
    key = crypto.createHash("sha256").update(ENV.ENCRYPTION_KEY).digest();
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(enc) {
  if (!ENV.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY not configured");
  }

  const [ivHex, authTagHex, data] = enc.split(":");
  
  // Use ENCRYPTION_KEY directly as a 32-byte key, or derive it
  let key;
  if (ENV.ENCRYPTION_KEY.length === 64) {
    key = Buffer.from(ENV.ENCRYPTION_KEY, "hex");
  } else {
    key = crypto.createHash("sha256").update(ENV.ENCRYPTION_KEY).digest();
  }

  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  
  let decrypted = decipher.update(data, "hex", "utf8");
  return decrypted + decipher.final("utf8");
}
