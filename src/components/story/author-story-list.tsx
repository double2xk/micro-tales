"use client";
import DeleteStoryButton from "@/components/story/delete-story-btn";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {type Story, type User, UserRole} from "@/server/db/schema";
import {api} from "@/trpc/react";
import {getGenreColorClassName} from "@/utils/colors";
import {siteContent} from "@/utils/site-content";
import {capitaliseFirstLetter} from "@/utils/string";
import {format} from "date-fns/format";
import {Edit, Eye, EyeOff, Star} from "lucide-react";
import type {Session} from "next-auth";
import Link from "next/link";

interface Props {
	initialStories: Story[];
	author: Partial<User>;
	session: Session | null;
	authorId: string;
}

export default function AuthorStoryList(props: Props) {
	const isMe =
		props.session?.user.role === UserRole.Admin ||
		props.authorId === props.session?.user.id;

	const stories = api.story.getStoriesByAuthorId.useQuery(
		{
			authorId: props.authorId,
		},
		{
			initialData: props.initialStories,
			gcTime: 0,
			staleTime: 0,
		},
	);

	return (
		<div className="space-y-4">
			{stories.data.length < 1 ? (
				<Card className={"border-purple-400 border-dashed bg-purple-50"}>
					<CardHeader>
						<CardTitle>There are no stories yet. </CardTitle>
						<CardDescription>
							{`Maybe some day ${isMe ? "you" : props.author?.name?.split(" ")[0]} will write one?`}
						</CardDescription>
					</CardHeader>
				</Card>
			) : (
				stories.data.map((story) => (
					<StoryCard key={story.id} isMe={isMe} {...story} />
				))
			)}
		</div>
	);
}

function StoryCard(
	props: Story & {
		onDelete?: () => void;
		isMe: boolean;
		author: { name: string };
	},
) {
	const {
		id,
		title,
		genre,
		authorId,
		createdAt,
		rating,
		isPublic,
		isMe,
		onDelete,
	} = props;
	return (
		<Card className="justify-between p-4 shadow-xs sm:flex-row sm:items-center">
			<div className="mb-1 sm:mb-0">
				<div className="flex items-center gap-2">
					<h3 className="truncate font-medium">{title}</h3>
					<div className="flex items-center text-muted-foreground text-sm">
						{isPublic ? (
							<Eye className="mr-1 h-3 w-3" />
						) : (
							<EyeOff className="mr-1 h-3 w-3" />
						)}
						<span>{isPublic ? "Public" : "Private"}</span>
					</div>
				</div>
				<div className="mt-2 flex items-center gap-3 text-muted-foreground text-sm">
					<Badge variant="secondary" className={getGenreColorClassName(genre)}>
						{capitaliseFirstLetter(genre)}
					</Badge>
					<span>{format(new Date(createdAt || ""), "MMMM dd, yyyy")}</span>
					<div className="flex items-center">
						<span className="mr-1">{rating}</span>
						<Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
					</div>
				</div>
			</div>
			<div className="flex gap-2 max-sm:[&>*]:flex-1">
				<Button variant="secondary" size="sm" asChild={true}>
					<Link href={siteContent.links.story.href.replace("{id}", id)}>
						<Eye />
						View
					</Link>
				</Button>
				{isMe && (
					<>
						<Button variant="secondary" size="sm" asChild={true}>
							<Link href={siteContent.links.editStory.href.replace("{id}", id)}>
								<Edit className="h-3 w-3" />
								Edit
							</Link>
						</Button>
						<DeleteStoryButton storyId={id} authorId={authorId ?? ""} />
					</>
				)}
			</div>
		</Card>
	);
}
