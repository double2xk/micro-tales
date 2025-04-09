import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowRight, Star} from "lucide-react";
import Link from "next/link";

const FeatueredStoryCard = () => {
	return (
		<Card className="mx-auto max-w-3xl px-3">
			<CardHeader>
				<CardTitle className={"flex justify-between font-serif text-2xl"}>
					The Last Light
					<div className="flex items-center">
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								className={`h-4 w-4 ${star <= 4 ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`}
							/>
						))}
					</div>
				</CardTitle>
				<CardDescription>
					<span className="text-muted-foreground text-sm">
						by Sarah Johnson
					</span>
					<Badge variant="secondary" className="rounded-full">
						Sci-Fi
					</Badge>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="mb-4 font-serif text-lg">
					The last light flickered in the distance. She had been walking for
					days, following its persistent glow across the barren landscape. As
					she drew closer, the truth became clear: it wasn't a rescue beacon,
					but...
				</p>
			</CardContent>
			<CardFooter className={"justify-end"}>
				<Button variant="ghost" className="group" asChild={true}>
					<Link href="/story/1">
						Read More
						<ArrowRight className="ml-2 h-4 w-4 transition-all group-hover:ml-3" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
};

const FeaturedStory = () => {
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
				<FeatueredStoryCard />
			</div>
		</section>
	);
};

export default FeaturedStory;
