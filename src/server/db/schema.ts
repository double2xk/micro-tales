import {relations, sql} from "drizzle-orm";
import {boolean, index, integer, pgTableCreator, primaryKey, text, timestamp, uuid,} from "drizzle-orm/pg-core";
import type {AdapterAccount} from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `micro-tales-app_${name}`);

// -----------------
// Account Table
// -----------------
export const users = createTable("user", (d) => ({
	id: d
		.uuid("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	passwordHash: d.varchar({ length: 255 }).notNull().default(""),
	createdAt: d.timestamp("created_at").defaultNow(),
	updatedAt: d.timestamp("updated_at").defaultNow(),
}));

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
	stories: many(stories),
	ratings: many(ratings),
	reads: many(storyReads),
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d.uuid("user_id").references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d.uuid("user_id").references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// -----------------
// Story Table
// -----------------
export const stories = createTable("story", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	genre: text("genre").notNull(),
	rating: integer("rating").default(0),
	views: integer("views").default(0),
	readingTime: integer("reading_time").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	editedAt: timestamp("edited_at").defaultNow(),
	isPublic: boolean("is_public").default(true),
	isGuest: boolean("is_guest").default(false),
	secretCode: text("secret_code"),
	authorId: uuid("author_id").references(() => users.id, {
		onDelete: "set null",
	}),
});

export type Story = typeof stories.$inferSelect;

export const storiesRelations = relations(stories, ({ one }) => ({
	author: one(users, {
		fields: [stories.authorId],
		references: [users.id],
	}),
}));

// -----------------
// Ratings Table
// -----------------
export const ratings = createTable("ratings", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	storyId: uuid("story_id").references(() => stories.id, {
		onDelete: "cascade",
	}),
	rating: integer("rating").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export type Rating = typeof ratings.$inferSelect;

export const ratingRelations = relations(ratings, ({ one }) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id],
	}),
	story: one(stories, {
		fields: [ratings.storyId],
		references: [stories.id],
	}),
}));

// -----------------
// Story Reads Table
// -----------------
export const storyReads = createTable("story_read", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, {
		onDelete: "set null",
	}),
	storyId: uuid("story_id").references(() => stories.id, {
		onDelete: "cascade",
	}),
	readAt: timestamp("read_at").defaultNow(),
});

export type StoryRead = typeof storyReads.$inferSelect;

export const storyReadRelations = relations(storyReads, ({ one }) => ({
	user: one(users, {
		fields: [storyReads.userId],
		references: [users.id],
	}),
	story: one(stories, {
		fields: [storyReads.storyId],
		references: [stories.id],
	}),
}));

// -----------------
// Edit Access Tokens Table
// -----------------
export const editAccessTokens = createTable("edit_access_tokens", {
	id: uuid("id").defaultRandom().primaryKey(),
	storyId: uuid("story_id").references(() => stories.id, {
		onDelete: "cascade",
	}),
	token: text("token").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
});

export type EditAccessToken = typeof editAccessTokens.$inferSelect;

export const editAccessTokensRelations = relations(
	editAccessTokens,
	({ one }) => ({
		story: one(stories, {
			fields: [editAccessTokens.storyId],
			references: [stories.id],
		}),
	}),
);
