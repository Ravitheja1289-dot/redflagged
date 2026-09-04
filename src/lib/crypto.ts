import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token.
 * Returns an opaque token string.
 */
export function generateManagementToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Creates a SHA-256 hash of the token for database storage.
 * We store the hash so that even if the database is leaked, 
 * the tokens cannot be used to manage reports.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
