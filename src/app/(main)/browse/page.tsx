import {Badge} from "@/components/ui/badge";
import {Button, buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {cn} from "@/lib/utils";
import {ArrowRight, Search, Star} from "lucide-react";
import Link from "next/link";

const stories = [
	{
		id: "1",
		title: "The Last Light",
		author: "Sarah Johnson",
		genre: "Sci-Fi",
		rating: 4.5,
		excerpt:
			"The last light flickered in the distance. She had been walking for days, following its persistent glow across the barren landscape...",
	},
	{
		id: "2",
		title: "Whispers in the Wind",
		author: "Michael Chen",
		genre: "Mystery",
		rating: 4.2,
		excerpt:
			"The note arrived on Tuesday, carried by a wind that shouldn't have been blowing...",
	},
	{
		id: "3",
		title: "Five Minutes",
		author: "Elena Rodriguez",
		genre: "Romance",
		rating: 4.8,
		excerpt:
			"Five minutes was all it took to change everything. The train was late...",
	},
	{
		id: "4",
		title: "The Forgotten Door",
		author: "James Wilson",
		genre: "Fable",
		rating: 3.9,
		excerpt:
			"Nobody remembered when the door first appeared in the village square...",
	},
	{
		id: "5",
		title: "Midnight Visitor",
		author: "Aisha Patel",
		genre: "Spooky",
		rating: 4.7,
		excerpt:
			"The knocking came at exactly midnight, three sharp raps that echoed through...",
	},
	{
		id: "6",
		title: "The Observer",
		author: "Thomas Wright",
		genre: "Sci-Fi",
		rating: 4.1,
		excerpt:
			"From my window, I could see them all. Every morning, same routine...",
	},
];

const StoryCard = (props: (typeof stories)[number]) => {
	return (
		<Card className={"gap-1.5"}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<h3 className="font-bold font-serif text-xl">{props.title}</h3>
					<Badge variant="default">{props.genre}</Badge>
				</div>
				<CardDescription>by {props.author}</CardDescription>
			</CardHeader>
			<CardContent className={"space-y-2.5"}>
				<div className="flex items-center">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							className={`h-4 w-4 ${star <= 4 ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`}
						/>
					))}
					<span className="ml-1 text-muted-foreground text-xs">
						{props.rating}
					</span>
				</div>
				<p className="mb-4 line-clamp-2 font-story text-paper-charcoal text-sm dark:text-paper-vanilla">
					{props.excerpt}
				</p>
			</CardContent>

			<CardFooter className="justify-end">
				<Button size="sm" variant="ghost" asChild={true} className={"group"}>
					<Link href={`/story/${props.id}`}>
						Read
						<ArrowRight className="ml-1 h-4 w-4 transition-all group-hover:ml-1.5" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
};

export default function BrowsePage() {
	// This would be fetched from an API in a real implementation

	return (
		<div className="container-centered px-4 py-12">
			<div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<h1 className="font-bold font-serif text-3xl text-paper-charcoal dark:text-paper-vanilla">
					Browse Stories
				</h1>
				<div className="relative w-full md:w-auto">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-paper-gray" />
					<Input placeholder="Search stories..." className={"pl-10"} />
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
								<SelectItem value="fable">Fable</SelectItem>
								<SelectItem value="spooky">Spooky</SelectItem>
								<SelectItem value="romance">Romance</SelectItem>
								<SelectItem value="sci-fi">Sci-Fi</SelectItem>
								<SelectItem value="mystery">Mystery</SelectItem>
								<SelectItem value="misc">Misc</SelectItem>
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

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{stories.map((story) => (
					<StoryCard key={story.id} {...story} />
				))}
			</div>
		</div>
	);
}
