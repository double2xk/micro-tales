// src/utils/hashPassword.ts
import {createHash} from 'node:crypto';

/**
 * Hash a password using a secure algorithm (SHA-512)
 * This is a pure JavaScript implementation that doesn't rely on native modules
 *
 * @param password The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	// Use a salt prefix for added security
	const salt = "micro-tales-secure-salt-";
	const saltedPassword = salt + password;

	// Use SHA-512 for hashing (more secure than SHA-256)
	const hash = createHash("sha512");
	hash.update(saltedPassword);
	return hash.digest("hex");
}

/**
 * Verify a password against a hash
 *
 * @param password The password to verify
 * @param hash The hash to verify against
 * @returns True if the password matches the hash
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	const hashedInput = await hashPassword(password);
	return hashedInput === hash;
}

/* Archived due to issues with docker compose and bcrypt */

// import * as bcrypt from 'bcrypt';
//
// async function hashPassword(password: string): Promise<string> {
// 	// Salt rounds determine how complex the hashing is (higher = more secure but slower)
// 	const saltRounds = 10;
// 	return await bcrypt.hash(password, saltRounds);
// }
//
// async function verifyPassword(
// 	password: string,
// 	hashedPassword: string,
// ): Promise<boolean> {
// 	return await bcrypt.compare(password, hashedPassword);
// }
//
// export { hashPassword, verifyPassword };
