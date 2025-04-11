import {DebouncedInput} from "@/components/query/input-query";
import {Badge} from "@/components/ui/badge";
import {Button, buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {cn} from "@/lib/utils";
import {type Story, StoryGenre} from "@/server/db/schema";
import {api} from "@/trpc/server";
import {getGenreColorClassName} from "@/utils/colors";
import {siteContent} from "@/utils/site-content";
import {ArrowRight, Search, Star} from "lucide-react";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BrowsePage(props: Props) {
	const searchParams = await props.searchParams;
	const [page, search, genre, sortBy, publicOnly] = [
		searchParams.page
			? Number.isNaN(Number(searchParams.page))
				? 1
				: Number(searchParams.page)
			: 1,
		searchParams.search ? String(searchParams.search) : "",
		searchParams.genre ? String(searchParams.genre) : "all",
		searchParams.sort ? String(searchParams.sort) : "newest",
		searchParams.publicOnly === "true",
	];

	const stories = await api.story.getStoriesPaginated({
		limit: 6,
		page,
		search,
		genre: genre === "all" ? undefined : genre,
		sortBy,
		publicOnly,
	});

	return (
		<div className="container-centered px-4 py-12 lg:max-w-5xl">
			<div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<h1 className="font-bold font-serif text-3xl text-paper-charcoal dark:text-paper-vanilla">
					Browse Stories
				</h1>
				<div className="relative w-full md:w-auto">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-paper-gray" />
					<DebouncedInput
						queryKey={"search"}
						placeholder="Search stories..."
						className={"pl-10"}
					/>
				</div>
			</div>

			<div className="mb-8 rounded-lg bg-secondary p-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className={"space-y-2"}>
						<Label htmlFor="genre">Genre</Label>
						<Select defaultValue="all">
							<SelectTrigger
								id="genre"
								className={cn(
									buttonVariants({ variant: "outline" }),
									"w-full justify-between hover:bg-background",
								)}
							>
								<SelectValue placeholder="All Genres" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Genres</SelectItem>
								{Object.entries(StoryGenre).map(([key, value]) => (
									<SelectItem key={key} value={value}>
										{value.charAt(0).toUpperCase() + value.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className={"space-y-2"}>
						<Label htmlFor="sort">Sort By</Label>
						<Select defaultValue="newest">
							<SelectTrigger
								id="sort"
								className={cn(
									buttonVariants({ variant: "outline" }),
									"w-full justify-between hover:bg-background",
								)}
							>
								<SelectValue placeholder="Sort By" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest</SelectItem>
								<SelectItem value="highest">Highest Rated</SelectItem>
								<SelectItem value="most-read">Most Read</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-end space-x-2 pt-6">
						<Switch id="public-only" />
						<Label htmlFor="public-only">Public Stories Only</Label>
					</div>
				</div>
			</div>

			<div
				className={cn(
					"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
					stories.data.length ? "h-max" : "min-h-[20rem]",
				)}
			>
				{stories.data.length
					? stories.data.map((story) => <StoryCard key={story.id} {...story} />)
					: null}
			</div>
		</div>
	);
}
const StoryCard = (props: Story & { author: { name: string } }) => {
	return (
		<Card className={"min-h-[14.5rem] gap-1.5"}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<h3 className="font-bold font-serif text-xl">{props.title}</h3>
					<Badge
						variant="default"
						className={getGenreColorClassName(props.genre as StoryGenre)}
					>
						{props.genre.charAt(0).toUpperCase() + props.genre.slice(1)}
					</Badge>
				</div>
				<CardDescription>by {props?.author?.name}</CardDescription>
			</CardHeader>
			<CardContent className={"space-y-2.5"}>
				<div className="flex items-center">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							className={`h-4 w-4 ${star <= (props.rating ?? 0) ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`}
						/>
					))}
					<span className="ml-1 text-muted-foreground text-xs">
						{props.rating}
					</span>
				</div>
				<p className="mb-4 line-clamp-2 font-story text-paper-charcoal text-sm dark:text-paper-vanilla">
					{props.content.substring(0, 200)}...
				</p>
			</CardContent>
			<CardFooter className="mt-auto justify-end">
				<Button size="sm" variant="ghost" asChild={true} className={"group"}>
					<Link href={siteContent.links.story.href.replace("{id}", props.id)}>
						Read
						<ArrowRight className="ml-1 h-4 w-4 transition-all group-hover:ml-1.5" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
};
