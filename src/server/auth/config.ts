import {db} from "@/server/db";
import {accounts, sessions, type UserRole, users, verificationTokens,} from "@/server/db/schema";
import {verifyPassword} from "@/utils/hashPassword";
import {siteContent} from "@/utils/site-content";
import {DrizzleAdapter} from "@auth/drizzle-adapter";
import {eq} from "drizzle-orm";
import type {DefaultSession, NextAuthConfig} from "next-auth";
import Credentials from "next-auth/providers/credentials"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			name: string;
			email: string;
			role: UserRole;
		};
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const { email, password } = credentials as {
					email: string;
					password: string;
				};

				try {
					const [user] = await db
						.select()
						.from(users)
						.where(eq(users.email, email));

					console.log("USER", user);
					console.log("CREDENTIALS", credentials);

					if (!user) throw new Error("No user found");

					const isValid = await verifyPassword(password, user?.passwordHash);

					if (!isValid) {
						throw new Error("Invalid credentials");
					}

					return {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
					};
				} catch (error) {
					console.log("[Auth Config] Sign In Error", error);
					return null;
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
	callbacks: {
		session: async ({ session, token }) => {
			if (token.sub) session.user.id = token.sub;
			return session;
		},
	},
	pages: {
		signIn: siteContent.links.login.href,
	},
} satisfies NextAuthConfig;
