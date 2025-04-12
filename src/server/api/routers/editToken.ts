import {generateSecretCode} from "@/lib/utils";
import {db} from "@/server/db";
import {editAccessTokens, stories, StoryGenre} from "@/server/db/schema";
import {generateEditToken} from "@/utils/generateToken";
import {calculateReadingTime} from "@/utils/story";
import {TRPCError} from "@trpc/server";
import {addHours} from "date-fns";
import {and, eq} from "drizzle-orm";
import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "../trpc";

export const editTokenRouter = createTRPCRouter({
	claimStory: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				secret: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Attempt to find a guest story with the given secret code
				const story = await db.query.stories.findFirst({
					where: and(
						eq(stories.secretCode, input.secret),
						eq(stories.isGuest, true),
					),
				});

				// Throw error if no story is found
				if (!story) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid secret code.",
					});
				}

				// Generate a new edit token
				const token = generateEditToken();
				const expiresAt = addHours(new Date(), 2); // Token expires in 2 hours

				// Insert the token into the database
				await db.insert(editAccessTokens).values({
					storyId: story.id,
					token,
					expiresAt,
				});

				return { token, storyId: story.id };
			} catch (error) {
				console.error("Error claiming story:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while claiming the story.",
				});
			}
		}),

	getEditStoryDetailsByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ input }) => {
			try {
				// Attempt to find the edit access token
				const result = await db.query.editAccessTokens.findFirst({
					where: eq(editAccessTokens.token, input.token),
					with: {
						story: true,
					},
				});

				// Throw error if the token is not found
				if (!result) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Token not found.",
					});
				}

				// Check if the token is expired
				if (new Date() > new Date(result.expiresAt)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Token expired.",
					});
				}

				// Return the associated story
				return {
					success: true,
					data: { ...result.story },
				};
			} catch (error: any) {
				console.error("Error fetching story by token:", error);
				return {
					success: false,
					message:
						error?.message ??
						"An error occurred while fetching the story details.",
				};
			}
		}),

	editStoryByToken: publicProcedure
		.input(
			z.object({
				token: z.string(),
				title: z.string(),
				content: z.string(),
				genre: z.nativeEnum(StoryGenre),
				isPublic: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Attempt to find the edit access token
				const result = await db.query.editAccessTokens.findFirst({
					where: eq(editAccessTokens.token, input.token),
				});

				// Throw error if the token is invalid or expired
				if (!result) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid or expired token.",
					});
				}

				// Calculate the reading time based on content length
				const readingTime = calculateReadingTime(input.content);

				// Generate a new secret code for the story claim
				const newSecret = generateSecretCode(); // Refresh secret

				// Update the story with the new details
				const [story] = await db
					.update(stories)
					.set({
						title: input.title,
						content: input.content,
						genre: input.genre,
						isPublic: input.isPublic,
						editedAt: new Date(),
						readingTime,
						secretCode: newSecret,
					})
					.where(eq(stories.id, result.storyId || ""))
					.returning();

				// Clean up the edit token
				await db
					.delete(editAccessTokens)
					.where(eq(editAccessTokens.token, input.token));

				return { story, secret: newSecret };
			} catch (error) {
				console.error("Error editing story by token:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while editing the story.",
				});
			}
		}),
	deleteStoryByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ input }) => {
			try {
				// Attempt to find the edit access token
				const result = await db.query.editAccessTokens.findFirst({
					where: eq(editAccessTokens.token, input.token),
				});

				// Throw error if the token is invalid or expired
				if (!result?.storyId) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid or expired token.",
					});
				}

				// Delete the story associated with the token
				await db.delete(stories).where(eq(stories.id, result.storyId));

				// Clean up the edit token
				await db
					.delete(editAccessTokens)
					.where(eq(editAccessTokens.token, input.token));

				return { success: true };
			} catch (error: any) {
				console.error("Error deleting story by token:", error);
				return {
					success: false,
					message:
						error?.message ?? "An error occurred while deleting the story.",
				};
			}
		}),
});
