import {db} from "@/server/db";
import {stories, type Story, StoryGenre, type User, UserRole, users} from "@/server/db/schema";
import {hashPassword} from "@/utils/hashPassword";

async function seed() {
	const exampleStories: Partial<Story>[] = [
		{
			title: "The Forgotten Island",
			content: "Once upon a time in a forgotten island...",
			genre: StoryGenre.Adventure,
			rating: 2.5,
			readingTime: 2,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
		{
			title: "The Haunted Clocktower",
			content: "It ticked... even when the gears were gone.",
			genre: StoryGenre.Horror,
			rating: 0,
			readingTime: 1,
			isPublic: true,
			isGuest: true,
			authorId: null,
		},
		{
			title: "The Lost Treasure of Atlantis",
			content: "A map to the lost city...",
			genre: StoryGenre.Adventure,
			rating: 3,
			readingTime: 3,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
		{
			title: "The Enchanted Forest",
			content: "Where magic and reality intertwine...",
			genre: StoryGenre.Fantasy,
			rating: 1.5,
			readingTime: 4,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
		{
			title: "The Time Traveler's Dilemma",
			content: "What if you could change the past?",
			genre: StoryGenre.ScienceFiction,
			rating: 5,
			readingTime: 5,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
		{
			title: "The Whispering Shadows",
			content: "They told secrets of the night...",
			genre: StoryGenre.Horror,
			rating: 0,
			readingTime: 2,
			isPublic: true,
			isGuest: true,
			authorId: null,
		},
		{
			title: "The Last Starship",
			content: "In a galaxy far away...",
			genre: StoryGenre.ScienceFiction,
			rating: 3.7,
			readingTime: 6,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
		{
			title: "The Secret Garden",
			content: "A place where dreams bloom...",
			genre: StoryGenre.Fantasy,
			rating: 5,
			readingTime: 3,
			isPublic: true,
			isGuest: false,
			authorId: null,
		},
	];

	await db.insert(stories).values(exampleStories as Story[]);

	const passwordHash = await hashPassword("password123");

	const exampleAccounts: Partial<User>[] = [
		{
			name: "John Doe",
			email: "john@doe.com",
			emailVerified: new Date(),
			role: UserRole.Author,
			passwordHash,
		},
		{
			name: "Admin User",
			email: "admin@admin.com",
			emailVerified: new Date(),
			role: UserRole.Admin,
			passwordHash,
		},
	];

	await db.insert(users).values(exampleAccounts as User[]);

	console.log("🌱 Seed complete.");
}

seed().catch((err) => {
	console.error("❌ Seed error:", err);
	process.exit(1);
});
