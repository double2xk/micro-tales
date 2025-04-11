import {DebouncedInput} from "@/components/query/query-input";
import {QueryPagination} from "@/components/query/query-pagination";
import {QuerySelect} from "@/components/query/query-select";
import {QuerySwitch} from "@/components/query/query-switch";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {RatingStars} from "@/components/utils/rating-stars";
import {cn} from "@/lib/utils";
import {auth} from "@/server/auth";
import {type Story, StoryGenre} from "@/server/db/schema";
import {api} from "@/trpc/server";
import {getGenreColorClassName} from "@/utils/colors";
import {siteContent} from "@/utils/site-content";
import {capitaliseFirstLetter} from "@/utils/string";
import {ArrowRight, InfoIcon, Search} from "lucide-react";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BrowsePage(props: Props) {
	const session = await auth();
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
		publicOnly: session?.user?.id ? publicOnly : true,
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
						<QuerySelect
							defaultValue={genre}
							queryKey={"genre"}
							options={[
								{
									label: "All Genres",
									value: "all",
								},
								...Object.values(StoryGenre).map((value) => ({
									label: value.charAt(0).toUpperCase() + value.slice(1),
									value: value,
								})),
							]}
							placeholder="All Genres"
						/>
					</div>
					<div className={"space-y-2"}>
						<Label htmlFor="sort">Sort By</Label>
						<QuerySelect
							defaultValue={sortBy}
							queryKey={"sort"}
							options={[
								{ label: "Newest", value: "newest" },
								{ label: "Highest Rated", value: "highestRated" },
								{ label: "Most Read", value: "mostRead" },
							]}
							placeholder="Newest"
						/>
					</div>
					<div className="flex items-center justify-end space-x-2 pt-6">
						<Popover>
							<PopoverTrigger
								className={
									!session?.user?.id ? "block cursor-pointer" : "hidden"
								}
							>
								<InfoIcon className={"size-4 text-muted-foreground"} />
							</PopoverTrigger>
							<PopoverContent
								align={"center"}
								side={"top"}
								className={"whitespace-nowrap bg-primary"}
							>
								<p className="text-primary-foreground text-xs">
									Only logged in users can see private stories.
								</p>
							</PopoverContent>
						</Popover>
						<QuerySwitch
							queryKey={"publicOnly"}
							defaultValue={session?.user?.id ? publicOnly : true}
							disabled={!session?.user?.id}
						/>
						<Label htmlFor="publicOnly">Public Stories Only</Label>
					</div>
				</div>
			</div>
			{stories.data.length > 0 ? (
				<div
					className={cn(
						"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
						stories.data.length ? "h-max" : "min-h-[20rem]",
					)}
				>
					{stories.data.map((story) => (
						/* @ts-ignore <Author not being indexed but is passed> */
						<StoryCard key={story.id} {...story} />
					))}
				</div>
			) : (
				<div className="flex h-[10rem] items-center justify-center">
					<p className="text-muted-foreground">
						No stories found. Try changing your search or filters.
					</p>
				</div>
			)}
			{stories.data.length > 0 && (
				<div
					className={"mt-10 flex w-full flex-col items-center justify-center"}
				>
					<QueryPagination queryKey={"page"} totalPages={stories.totalPages} />
					{stories.totalPages > 1 && (
						<p className="mt-3 text-muted-foreground text-sm">
							Page {stories.page} of {stories.totalPages}
						</p>
					)}
				</div>
			)}
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
						{capitaliseFirstLetter(props.genre)}
					</Badge>
				</div>
				<CardDescription>by {props?.author?.name}</CardDescription>
			</CardHeader>
			<CardContent className={"space-y-2.5"}>
				<div className="flex items-center">
					<RatingStars rating={props.rating || 0} className={"size-4"} />
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
