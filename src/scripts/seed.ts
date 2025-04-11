import {db} from "@/server/db";
import {stories, type Story, StoryGenre, type User, UserRole, users} from "@/server/db/schema";
import {hashPassword} from "@/utils/hashPassword";

async function seed() {
	const exampleStories: Partial<Story>[] = [
		{
			title: "The Forgotten Island",
			content: "Once upon a time in a forgotten island...",
			genre: StoryGenre.Adventure,
			rating: 0,
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
	];

	await db.insert(stories).values(exampleStories);

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

	await db.insert(users).values(exampleAccounts);

	console.log("🌱 Seed complete.");
}

seed().catch((err) => {
	console.error("❌ Seed error:", err);
	process.exit(1);
});
