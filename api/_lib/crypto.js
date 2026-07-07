/**
 * Secret encryption helpers — AES-256-GCM for at-rest secrets in the DB
 * (currently Company.anthropicKeyEnc).
 *
 * Wire format: base64(iv).base64(ciphertext).base64(authTag)
 *
 * Key: ANTHROPIC_KEY_ENCRYPTION_SECRET — 32 bytes as 64 hex chars.
 * Generate with: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // GCM-recommended nonce length

function encryptionKey() {
  const hex = process.env.ANTHROPIC_KEY_ENCRYPTION_SECRET;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex.trim())) {
    const err = new Error(
      'Server misconfiguration: ANTHROPIC_KEY_ENCRYPTION_SECRET must be set to 32 bytes of hex (openssl rand -hex 32)'
    );
    err.status = 500;
    throw err;
  }
  return Buffer.from(hex.trim(), 'hex');
}

/** Encrypts a UTF-8 string. Returns "iv.ciphertext.authTag" (each base64). */
export function encryptSecret(plaintext) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('encryptSecret requires a non-empty string');
  }
  const key = encryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${ciphertext.toString('base64')}.${authTag.toString('base64')}`;
}

/** Decrypts an "iv.ciphertext.authTag" string produced by encryptSecret. */
export function decryptSecret(encoded) {
  if (typeof encoded !== 'string') throw new Error('decryptSecret requires a string');
  const parts = encoded.split('.');
  if (parts.length !== 3) throw new Error('Malformed encrypted secret');

  const key = encryptionKey();
  const [iv, ciphertext, authTag] = parts.map((p) => Buffer.from(p, 'base64'));
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
