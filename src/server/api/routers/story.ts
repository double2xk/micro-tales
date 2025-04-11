import {generateSecretCode} from "@/lib/utils";
import {db} from "@/server/db";
import {stories, StoryGenre} from "@/server/db/schema";
import {TRPCError} from "@trpc/server";
import {and, count, desc, eq, ilike, or} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "../trpc";

export const storyRouter = createTRPCRouter({
	createStory: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				genre: z.nativeEnum(StoryGenre),
				isPublic: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// Ensure user is authenticated
				if (!ctx.session.user.id) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be logged in to create a story.",
					});
				}

				const wordCount = input.content.trim().split(/\s+/).length;
				const readingTime = Math.ceil(wordCount / 200);

				const result = await db
					.insert(stories)
					.values({
						...input,
						authorId: ctx.session.user.id,
						isGuest: false,
						readingTime,
					})
					.returning();

				if (!result || result.length === 0) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Error creating the story.",
					});
				}

				return result[0];
			} catch (error) {
				console.error("Error creating story:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while creating the story.",
				});
			}
		}),

	createGuestStory: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				genre: z.nativeEnum(StoryGenre),
				isPublic: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const wordCount = input.content.trim().split(/\s+/).length;
				const readingTime = Math.ceil(wordCount / 200);
				const secret = generateSecretCode();

				const result = await db
					.insert(stories)
					.values({
						...input,
						authorId: null,
						isGuest: true,
						secretCode: secret,
						readingTime,
					})
					.returning();

				if (!result || result.length === 0) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Error creating the guest story.",
					});
				}

				return { story: result[0], secret };
			} catch (error) {
				console.error("Error creating guest story:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while creating the guest story.",
				});
			}
		}),

	getStoryById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			try {
				const story = await db.query.stories.findFirst({
					where: eq(stories.id, input.id),
					with: {
						author: {
							// @ts-ignore
							name: true,
						},
					},
				});

				if (!story) {
					return null;
				}

				return story;
			} catch (error) {
				console.error("Error fetching story by ID:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the story.",
				});
			}
		}),

	getFeaturedStory: publicProcedure.query(async () => {
		try {
			const result = await db.query.stories.findFirst({
				where: eq(stories.isPublic, true),
				orderBy: desc(stories.createdAt),
			});

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No featured story found.",
				});
			}

			return result;
		} catch (error) {
			console.error("Error fetching featured story:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "An error occurred while fetching the featured story.",
			});
		}
	}),

	getStoriesByAuthorId: publicProcedure
		.input(z.object({ authorId: z.string().uuid() }))
		.query(async ({ input }) => {
			try {
				const result = await db.query.stories.findMany({
					where: eq(stories.authorId, input.authorId),
				});

				if (!result || result.length === 0) {
					return [];
				}

				return result;
			} catch (error) {
				console.error("Error fetching stories by author ID:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the author's stories.",
				});
			}
		}),
	getStoriesPaginated: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(10),
				genre: z.string().optional(),
				search: z.string().optional(),
				publicOnly: z.boolean().optional(),
				sortBy: z.string().optional().default("newest"),
			}),
		)
		.query(async ({ input }) => {
			const { page, limit, genre, search, publicOnly, sortBy } = input;
			const offset = (page - 1) * limit;

			try {
				const whereClauses = [];

				if (genre) whereClauses.push(eq(stories.genre, genre as StoryGenre));
				if (publicOnly) whereClauses.push(eq(stories.isPublic, publicOnly));
				if (search)
					whereClauses.push(
						or(
							ilike(stories.title, `%${search}%`),
							ilike(stories.content, `%${search}%`),
						),
					);

				const orderClause =
					sortBy === "highestRated"
						? desc(stories.rating)
						: sortBy === "mostRead"
							? desc(stories.views)
							: desc(stories.createdAt);

				const [data, totalCount] = await Promise.all([
					db.query.stories.findMany({
						where: and(...whereClauses),
						orderBy: [orderClause],
						limit,
						offset,
						with: {
							author: {
								// @ts-ignore
								name: true,
							},
						},
					}),
					db
						.select({ count: count() })
						.from(stories)
						.where(and(...whereClauses))
						.then((res) => res[0]?.count ?? 0),
				]);

				const totalPages = Math.ceil(totalCount / limit);

				return {
					data,
					page,
					totalPages,
				};
			} catch (error) {
				return {
					data: [],
					page,
					totalPages: 0,
				};
			}
		}),
});
