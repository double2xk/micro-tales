import {db} from "@/server/db";
import {ratings, stories} from "@/server/db/schema";
import {TRPCError} from "@trpc/server";
import {and, eq} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "../trpc";

export const ratingRouter = createTRPCRouter({
	// Allows a user to rate a story
	rateStory: protectedProcedure
		.input(
			z.object({
				storyId: z.string().uuid(),
				userId: z.string().uuid(),
				rating: z.number().min(1).max(5),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { storyId, userId, rating } = input;

			// Find if the user has already rated the story
			const [existingRating] = await db
				.select()
				.from(ratings)
				.where(and(eq(ratings.storyId, storyId), eq(ratings.userId, userId)))
				.execute();

			// If the user has already rated the story, update the rating
			if (existingRating) {
				await db
					.update(ratings)
					.set({ rating })
					.where(and(eq(ratings.storyId, storyId), eq(ratings.userId, userId)));
			} else {
				// Insert the new rating into the ratings table
				await db.insert(ratings).values({
					storyId,
					userId,
					rating,
					createdAt: new Date(),
				});
			}

			// Calculate the new average rating
			const storyRatings = await db
				.select({ rating: ratings.rating })
				.from(ratings)
				.where(eq(ratings.storyId, storyId));

			// Calculate the average rating
			const totalRatings = storyRatings.length;
			const avgRating =
				totalRatings > 0
					? Number(
							(
								storyRatings.reduce((sum, { rating }) => sum + rating, 0) /
								totalRatings
							).toFixed(2),
						)
					: 0;

			// Update the story's average rating
			await db
				.update(stories)
				.set({ rating: avgRating })
				.where(eq(stories.id, storyId));

			return { success: true, avgRating };
		}),
	// Get logged-in users rating for a specific story
	getUsersStoryRating: protectedProcedure
		.input(z.object({ storyId: z.string().uuid() }))
		.query(async (opts) => {
			const {
				input: { storyId },
				ctx,
			} = opts;

			// Check if the user is logged in
			if (!ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be logged in to get their rating.",
				});
			}

			// Fetch the user's rating for the specific story
			const rating = await db
				.select({ rating: ratings.rating })
				.from(ratings)
				.where(
					and(
						eq(ratings.storyId, storyId),
						eq(ratings.userId, ctx.session.user.id),
					),
				)
				.limit(1)
				.execute();

			return rating[0]?.rating ?? 0;
		}),
	// Get author rankings based on average rating of their stories
	getAuthorRanking: publicProcedure.input(z.string()).query(async (opts) => {
		try {
			const { input: authorId } = opts;

			// Check if authorId is a valid string
			if (!authorId || typeof authorId !== "string") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid authorId provided.",
				});
			}

			const stories = await db.query.stories.findMany({
				where: {
					// @ts-ignore
					authorId: authorId || "",
				},
				select: {
					rating: true, // We only need the rating to calculate the average
				},
			});

			// If no stories are found for the author, return an appropriate message
			if (stories.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No stories found for the provided author.",
				});
			}

			// Step 2: Calculate the sum of the ratings and the total number of stories
			const totalRating = stories.reduce(
				(acc, story) => acc + (story.rating ?? 0),
				0,
			);
			const storyCount = stories.length;

			// Step 3: Calculate the average rating (if there are any stories)
			const avgRating = storyCount > 0 ? totalRating / storyCount : 0;

			// Step 4: Return the average rating and story count
			return {
				authorId,
				avgRating,
				storyCount,
			};
		} catch (error) {
			// Catch any errors (e.g., database errors, validation errors)
			console.error("Error calculating author ranking:", error);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					"An error occurred while fetching the author ranking. Please try again later.",
			});
		}
	}),
});
