import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
	// Salt rounds determine how complex the hashing is (higher = more secure but slower)
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return await bcrypt.compare(password, hashedPassword);
}

export { hashPassword, verifyPassword };
