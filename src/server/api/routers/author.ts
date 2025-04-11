import {db} from "@/server/db";
import {users} from "@/server/db/schema";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "../trpc";

export const authorRouter = createTRPCRouter({
	getAuthorById: publicProcedure
		.input(
			z.object({
				authorId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { authorId } = input;

			const parsed = await z.string().uuid().safeParseAsync(authorId);

			if (!parsed.success) {
				return null;
			}

			// Insert the new rating into the ratings table
			const author = await db.query.users.findFirst({
				where: eq(users.id, authorId),
			});

			if (!author?.id) {
				return null;
			}

			return {
				id: author.id,
				name: author.name,
				role: author.role,
				createdAt: author.createdAt,
				updatedAt: author.updatedAt,
			};
		}),
});
