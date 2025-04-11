import ShareStoryBtn from "@/components/story/share-story-btn";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import BackToStories from "@/components/utils/back-to-stories";
import {RatingStarsWithAction} from "@/components/utils/rating-stars";
import {cn} from "@/lib/utils";
import {auth} from "@/server/auth";
import {api} from "@/trpc/server";
import {getGenreColorClassName} from "@/utils/colors";
import {siteContent} from "@/utils/site-content";
import {capitaliseFirstLetter} from "@/utils/string";
import {format} from "date-fns/format";
import {ArrowLeft, BadgeInfoIcon, Calendar, Clock, InfoIcon, LogInIcon, PencilLineIcon} from "lucide-react";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StoryPage(props: Props) {
	const { id } = await props.params;
	const session = await auth();
	const story = await api.story.getStoryById({ id });

	if (!session?.user?.id && !story?.isPublic) {
		return (
			<div className="container-centered flex flex-col items-center justify-center gap-3 py-20">
				<BadgeInfoIcon className={"size-10"} />
				<h1 className="text-center font-bold text-2xl">
					You must be signed in to view private stories.
				</h1>
				<Button asChild={true} size={"lg"} className={"mt-2 min-w-xs"}>
					<Link href={siteContent.links.login.href}>
						<LogInIcon />
						Sign In
					</Link>
				</Button>
			</div>
		);
	}

	if (!story?.id) {
		return (
			<div className="container-centered flex flex-col items-center justify-center gap-3 py-12">
				<h1 className="text-center font-bold text-2xl">Story not found</h1>
				<Button asChild={true}>
					<Link href={"/"}>
						<ArrowLeft />
						Back to home
					</Link>
				</Button>
			</div>
		);
	}

	let myRating = 0;

	if (session?.user?.id) {
		const myRatingData = await api.rating.getUsersStoryRating({
			storyId: id,
		});
		myRating = myRatingData ?? 0;
	}

	return (
		<div className="container-centered py-12 md:max-w-3xl md:py-16">
			<div className="mb-8">
				<BackToStories />
				<h1 className="mb-4 font-bold font-serif text-3xl md:text-4xl">
					{story?.title}
				</h1>
				<div className="mb-6 flex flex-wrap items-center gap-4 text-paper-gray text-sm">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-full border bg-background uppercase">
							{(story?.author?.name ?? "Guest").substring(0, 2)}
						</div>
						<Link
							href={siteContent.links.author.href.replace(
								"{id}",
								story?.authorId || "",
							)}
							className={cn(
								"font-medium hover:underline",
								!story.authorId && "pointer-events-none cursor-not-allowed",
							)}
						>
							{story?.author?.name ?? "Guest"}
						</Link>
					</div>
					<Badge
						variant="default"
						className={getGenreColorClassName(story?.genre ?? "")}
					>
						{capitaliseFirstLetter(story?.genre)}
					</Badge>
					<div className="flex items-center">
						<Calendar className="mr-1 h-4 w-4" />
						<span>
							{format(new Date(story?.createdAt || ""), "dd MMMM yyyy")}
						</span>
					</div>
					<div className="flex items-center">
						<Clock className="mr-1 h-4 w-4" />
						<span>{story?.readingTime} min</span>
					</div>
				</div>
			</div>

			<div className="newspaper-card">
				<div className="max-w-none space-y-3 font-story text-lg text-paper-charcoal dark:text-paper-vanilla">
					{story?.content.split("\n\n").map((paragraph, index) => (
						<p key={index} className="leading-relaxed">
							{paragraph}
						</p>
					))}
				</div>
			</div>

			<div className="mt-12 border-t pt-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h3 className="mb-2 font-medium text-lg text-paper-charcoal dark:text-paper-vanilla">
							Rate this story
						</h3>
						<RatingStarsWithAction storyId={id} rating={myRating} />
					</div>
					<div className="flex gap-2">
						{story.authorId === session?.user?.id && (
							<Button asChild={true} size="sm">
								<Link
									href={siteContent.links.editStory.href.replace("{id}", id)}
								>
									<PencilLineIcon />
									Edit Story
								</Link>
							</Button>
						)}
						{!story.authorId && (
							<>
								<Popover>
									<PopoverTrigger className={"cursor-pointer"}>
										<InfoIcon className={"size-5 text-muted-foreground"} />
									</PopoverTrigger>
									<PopoverContent
										align={"center"}
										side={"top"}
										className={"w-max whitespace-nowrap bg-primary text-center"}
									>
										<p className="text-primary-foreground text-xs">
											Story belongs to you?
											<br />
											Claim it to edit and manage it.
										</p>
									</PopoverContent>
								</Popover>
								<Button asChild={true} size="sm">
									<Link href={siteContent.links.claimStory.href}>
										Edit Story
									</Link>
								</Button>
							</>
						)}
						<ShareStoryBtn storyId={story.id} variant="outline" size="sm" />
					</div>
				</div>
			</div>
		</div>
	);
}
