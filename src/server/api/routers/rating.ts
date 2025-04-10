import {db} from "@/server/db";
import {ratings, stories} from "@/server/db/schema";
import {TRPCError} from "@trpc/server";
import {eq} from "drizzle-orm";
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

			// Insert the new rating into the ratings table
			await db.insert(ratings).values({
				storyId,
				userId,
				rating,
				createdAt: new Date(),
			});

			// Calculate the new average rating
			const storyRatings = await db
				.select({ rating: ratings.rating })
				.from(ratings)
				.where(eq(ratings.storyId, storyId));

			// Calculate the average rating
			const totalRatings = storyRatings.length;
			const avgRating =
				totalRatings > 0
					? storyRatings.reduce((sum, { rating }) => sum + rating, 0) /
						totalRatings
					: 0;

			// Update the story's average rating
			await db
				.update(stories)
				.set({ rating: avgRating })
				.where(eq(stories.id, storyId));

			return { success: true, avgRating };
		}),
	// Get author rankings based on average rating of their stories
	getAuthorRanking: publicProcedure.input(z.string()).query(async (opts) => {
		try {
			const { input: authorId } = opts;

			// Input validation: Check if authorId is a valid string
			if (!authorId || typeof authorId !== "string") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid authorId provided.",
				});
			}

			// Step 1: Retrieve all stories for the specific author (user)
			const stories = await db.query.stories.findMany({
				where: {
					authorId: authorId || "", // Match by the authorId (userId)
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
