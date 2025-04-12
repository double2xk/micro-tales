import {generateSecretCode} from "@/lib/utils";
import {db} from "@/server/db";
import {editAccessTokens, stories, StoryGenre} from "@/server/db/schema";
import {generateEditToken} from "@/utils/generateToken";
import {calculateReadingTime} from "@/utils/story";
import {TRPCError} from "@trpc/server";
import {addHours} from "date-fns";
import {and, count, desc, eq, ilike, or} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "../trpc";

export const storyRouter = createTRPCRouter({
	createStory: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				genre: z.string().default(StoryGenre.Misc),
				isPublic: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const isValidGenre = await z
				.nativeEnum(StoryGenre)
				.safeParseAsync(input.genre);

			if (!isValidGenre.success) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid genre provided.",
				});
			}

			try {
				// Ensure user is authenticated
				if (!ctx.session.user.id) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be logged in to create a story.",
					});
				}

				const readingTime = calculateReadingTime(input.content);

				const result = await db
					.insert(stories)
					.values({
						...input,
						genre: input.genre as StoryGenre,
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
				genre: z.string().default(StoryGenre.Misc),
				isPublic: z.boolean().default(true),
				isGuest: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input }) => {
			const isValidGenre = await z
				.nativeEnum(StoryGenre)
				.safeParseAsync(input.genre);

			if (!isValidGenre.success) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid genre provided.",
				});
			}

			try {
				const readingTime = calculateReadingTime(input.content);
				const secret = generateSecretCode();

				const result = await db
					.insert(stories)
					.values({
						...input,
						genre: input.genre as StoryGenre,
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
	createStoryWithRegisterToken: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				genre: z.string().default(StoryGenre.Misc),
				isPublic: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input }) => {
			const isValidGenre = await z
				.nativeEnum(StoryGenre)
				.safeParseAsync(input.genre);

			if (!isValidGenre.success) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid genre provided.",
				});
			}

			try {
				const readingTime = calculateReadingTime(input.content);
				const [story] = await db
					.insert(stories)
					.values({
						...input,
						genre: input.genre as StoryGenre,
						isGuest: false,
						authorId: null,
						isVisible: false,
						readingTime,
					})
					.returning();

				if (!story) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Error creating story.",
					});
				}

				const token = generateEditToken("claim");
				const expiresAt = addHours(new Date(), 24); // valid for 24 hours

				await db.insert(editAccessTokens).values({
					storyId: story.id,
					token,
					expiresAt,
				});

				return { storyId: story.id, token };
			} catch (error) {
				console.error("Error creating story with register token:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create story with registration intent.",
				});
			}
		}),
	assignStoryAccount: protectedProcedure
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const access = await db.query.editAccessTokens.findFirst({
					where: eq(editAccessTokens.token, input.token),
				});

				if (!access?.storyId || new Date() > new Date(access.expiresAt)) {
					return {
						success: false,
						message: "Invalid or expired token.",
					};
				}

				const [story] = await db
					.update(stories)
					.set({ authorId: userId, isVisible: true })
					.where(eq(stories.id, access.storyId))
					.returning();

				if (!story) {
					return {
						success: false,
						message: "Story not found.",
					};
				}

				await db
					.delete(editAccessTokens)
					.where(eq(editAccessTokens.token, input.token));

				return { success: true, story };
			} catch (error) {
				console.error("Error assigning story to account:", error);
				return { success: false, message: "An unknown error occurred." };
			}
		}),
	deleteStory: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			try {
				// Fetch the story
				const story = await db.query.stories.findFirst({
					where: eq(stories.id, input.id),
				});

				if (!story) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Story not found.",
					});
				}

				// Check if the user is the author or an admin
				const isOwner = story.authorId === userId;
				const isAdmin = userRole === "admin";

				if (!isOwner && !isAdmin) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You do not have permission to delete this story.",
					});
				}

				// Delete the story
				await db.delete(stories).where(eq(stories.id, input.id));

				return { success: true, message: "Story deleted successfully." };
			} catch (error) {
				console.error("Error deleting story:", error);
				return {
					success: false,
					message: "An error occurred while deleting the story.",
				};
			}
		}),
	updateStory: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				genre: z.string(),
				isPublic: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			try {
				const story = await db.query.stories.findFirst({
					where: eq(stories.id, input.id),
				});

				if (!story) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Story not found.",
					});
				}

				const isOwner = story.authorId === userId;
				const isAdmin = userRole === "admin";

				if (!isOwner && !isAdmin) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You do not have permission to edit this story.",
					});
				}

				const readingTime = calculateReadingTime(input.content);

				await db
					.update(stories)
					.set({
						title: input.title,
						content: input.content,
						genre: input.genre as StoryGenre,
						isPublic: input.isPublic,
						readingTime,
					})
					.where(eq(stories.id, input.id));

				return { success: true, message: "Story updated successfully." };
			} catch (error) {
				console.error("Error editing story:", error);
				return {
					success: false,
					message: "An error occurred while editing the story.",
				};
			}
		}),
	getStoryById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			try {
				const isValidId = await z.string().uuid().safeParseAsync(input.id);

				if (!isValidId.success) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid story ID format.",
					});
				}
				const story = await db.query.stories.findFirst({
					where: and(eq(stories.id, input.id), eq(stories.isVisible, true)),
					with: {
						author: true,
					},
				});

				if (!story) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Story not found.",
					});
				}

				return {
					success: true,
					data: {
						...story,
						author: {
							name: story?.author?.name,
							role: story?.author?.role,
						},
					},
				};
			} catch (error: any) {
				console.error("Error fetching story by ID:", error);
				return {
					success: false,
					message:
						error?.message ?? "An error occurred while fetching the story.",
				};
			}
		}),

	getFeaturedStory: publicProcedure.query(async () => {
		try {
			const result = await db.query.stories.findFirst({
				where: and(
					eq(stories.isPublic, true),
					eq(stories.isGuest, false),
					eq(stories.isVisible, true),
				),
				with: {
					author: {
						// @ts-ignore
						name: true,
					},
				},
				orderBy: desc(stories.createdAt),
			});

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No featured story found.",
				});
			}

			return {
				success: true,
				data: { ...result },
			};
		} catch (error: any) {
			console.error("Error fetching featured story:", error);
			return {
				success: false,
				message:
					error?.message ??
					"An error occurred while fetching the featured story.",
			};
		}
	}),

	getStoriesByAuthorId: publicProcedure
		.input(z.object({ authorId: z.string().uuid() }))
		.query(async ({ input }) => {
			try {
				const result = await db.query.stories.findMany({
					where: and(
						eq(stories.authorId, input.authorId),
						eq(stories.isVisible, true),
					),
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
						where: and(...whereClauses, eq(stories.isVisible, true)),
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
