import AuthorStoryList from "@/components/story/author-story-list";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {auth} from "@/server/auth";
import {UserRole} from "@/server/db/schema";
import {api} from "@/trpc/server";
import {siteContent} from "@/utils/site-content";
import {capitaliseFirstLetter} from "@/utils/string";
import {format} from "date-fns/format";
import {ArrowLeft, Calendar, PlusIcon, Star,} from "lucide-react";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProfilePage(props: Props) {
	const { id: authorId } = await props.params;

	const session = await auth();

	const isMe = authorId === session?.user?.id;

	const author = await api.author.getAuthorById({ authorId });

	if (!author?.id) {
		return (
			<div className="container-centered flex flex-col items-center justify-center gap-3 py-12">
				<h1 className="text-center font-bold text-2xl">Author not found</h1>
				<Button asChild={true}>
					<Link href={"/"}>
						<ArrowLeft />
						Back to home
					</Link>
				</Button>
			</div>
		);
	}

	const stories = await api.story.getStoriesByAuthorId({ authorId });

	let averageRating = 0;

	if (stories.length) {
		const ratings = stories.map((story) => story.rating);
		const sum = ratings.reduce((acc, rating) => (acc ?? 0) + (rating ?? 0), 0);
		const average = sum ? sum / ratings.length : 0;
		averageRating = Math.round(average * 10) / 10;
	}

	return (
		<div className="container-centered py-12">
			<div className="mx-auto grid max-w-[900px] gap-8 lg:grid-cols-[300px_1fr]">
				<div>
					<Card className={"relative overflow-hidden"}>
						{!!author?.role && (
							<Badge
								variant={"default"}
								className={cn(
									"absolute top-0 left-0 rounded-none rounded-br-lg px-4 py-1",
									author.role === UserRole.Admin
										? "bg-yellow-100 text-yellow-600"
										: "bg-purple-100 text-purple-500",
								)}
							>
								{capitaliseFirstLetter(author?.role)}
							</Badge>
						)}
						<CardHeader>
							<div className="mb-2 flex justify-center">
								<Avatar className="size-24 text-xl uppercase">
									<AvatarFallback>
										{author?.name?.substring(0, 2)}
									</AvatarFallback>
								</Avatar>
							</div>
							<CardTitle className="text-center">{author?.name} </CardTitle>
							<CardDescription className="flex items-center justify-center gap-1 text-center">
								<Calendar className="h-3 w-3" />
								Joined {format(new Date(author.createdAt || ""), "MMMM yyyy")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">Stories</span>
									<span className="font-medium">{stories.length}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">
										Average Rating
									</span>
									<div className="flex items-center">
										<span className="mr-1 font-medium">{averageRating}</span>
										<Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className={"w-full"}>
					<div className="mb-6 flex items-center justify-between">
						<h1 className="font-bold font-serif text-3xl">
							{isMe
								? "My Stories"
								: `${(author?.name || "Anonymous").split(" ")[0]}'s Stories`}
						</h1>
						{isMe && (
							<Button asChild={true}>
								<Link href={siteContent.links.submit.href}>
									<PlusIcon />
									New Story
								</Link>
							</Button>
						)}
					</div>
					<AuthorStoryList
						initialStories={stories}
						session={session}
						author={author}
						authorId={authorId}
					/>
				</div>
			</div>
		</div>
	);
}
