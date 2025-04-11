import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {RatingStars} from "@/components/utils/rating-stars";
import {cn} from "@/lib/utils";
import type {Story} from "@/server/db/schema";
import {api} from "@/trpc/server";
import {getGenreColorClassName} from "@/utils/colors";
import {siteContent} from "@/utils/site-content";
import {capitaliseFirstLetter} from "@/utils/string";
import {ArrowRight} from "lucide-react";
import Link from "next/link";

export default async function FeaturedStory() {
	const featuredStory = await api.story.getFeaturedStory();
	return (
		<section id={"featured-story"}>
			<div className="container-centered">
				<div className="mb-10 flex flex-col items-center justify-center text-center">
					<div className="space-y-2">
						<h2 className="font-bold font-serif text-3xl tracking-tighter sm:text-4xl">
							Featured Story
						</h2>
						<p className="max-w-[700px] text-muted-foreground">
							Our editors' pick for today's must-read micro fiction
						</p>
					</div>
				</div>
				<FeaturedStoryCard {...featuredStory} />
			</div>
		</section>
	);
}

function FeaturedStoryCard(props: Story & { author?: { name: string } }) {
	const { title, rating, content, id, genre, author } = props;
	return (
		<Card className="mx-auto max-w-3xl px-3">
			<CardHeader>
				<CardTitle className={"flex justify-between font-serif text-2xl"}>
					{title}
					<RatingStars rating={rating ?? 0} />
				</CardTitle>
				<CardDescription>
					<span className="text-muted-foreground text-sm">
						by {author?.name}
					</span>{" "}
					<Badge className={cn("rounded-full", getGenreColorClassName(genre))}>
						{capitaliseFirstLetter(genre)}
					</Badge>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="mb-4 font-serif text-lg">
					{(content || "").substring(0, 400)}...
				</p>
			</CardContent>
			<CardFooter className={"justify-end"}>
				<Button variant="ghost" className="group" asChild={true}>
					<Link href={siteContent.links.story.href.replace("{id}", id)}>
						Read More
						<ArrowRight className="ml-2 h-4 w-4 transition-all group-hover:ml-3" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
