import {db} from "@/server/db";
import {users} from "@/server/db/schema";
import {hashPassword} from "@/utils/hashPassword";
import {TRPCError} from "@trpc/server";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "../trpc";

export const authRouter = createTRPCRouter({
	signUp: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
				email: z.string().email(),
				password: z.string().min(8),
			}),
		)
		.mutation(async ({ input }) => {
			const { name, email, password } = input;

			const existing = await db.query.users.findFirst({
				where: eq(users.email, email),
			});

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User already exists",
				});
			}

			const hashedPassword = await hashPassword(password);

			if (!hashedPassword) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error hashing password",
				});
			}

			const [user] = await db
				.insert(users)
				.values({
					name,
					email,
					passwordHash: hashedPassword,
				})
				.returning();

			return { user };
		}),
});
