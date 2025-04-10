import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import BackToStories from "@/components/utils/back-to-stories";
import {Calendar, Clock, Share2, Star} from "lucide-react";
import Link from "next/link";

export default function StoryPage({ params }: { params: { id: string } }) {
	// This would be fetched from an API in a real implementation
	const story = {
		id: params.id,
		title: "The Last Light",
		content: `The last light flickered in the distance. She had been walking for days, following its persistent glow across the barren landscape. As she drew closer, the truth became clear: it wasn't a rescue beacon, but the last functioning street lamp in what was once a thriving city.

    Beneath it stood a man, his silhouette sharp against the dim glow. He turned as she approached, eyes widening with the shock of seeing another human after so long.

    "I thought I was the only one left," he said, voice cracking from disuse.

    She smiled, reaching into her pocket. "You're not alone anymore." She pulled out a small solar-powered lamp and placed it beside his. Two lights now, where there had been one.

    "It's not much," she said, "but it's a start."

    He nodded, understanding. In a world of darkness, even the smallest light was an act of rebellion. Of hope.

    Together, they began to rebuild.`,
		author: "Sarah Johnson",
		authorId: "sarah-j",
		genre: "Sci-Fi",
		date: "2023-11-15",
		readingTime: "2 min",
		rating: 4.5,
	};

	return (
		<div className="container-centered py-12 md:max-w-3xl md:py-16">
			<div className="mb-8">
				<BackToStories />
				<h1 className="mb-4 font-bold font-serif text-3xl md:text-4xl">
					{story.title}
				</h1>
				<div className="mb-6 flex flex-wrap items-center gap-4 text-paper-gray text-sm">
					<div className="flex items-center gap-2">
						<Avatar className="size-8 border">
							<AvatarFallback className="bg-muted uppercase">
								{story.author.substring(0, 2)}
							</AvatarFallback>
						</Avatar>
						<Link
							href={`/author/${story.authorId}`}
							className="font-medium hover:underline"
						>
							{story.author}
						</Link>
					</div>
					<Badge variant="default">{story.genre}</Badge>
					<div className="flex items-center">
						<Calendar className="mr-1 h-4 w-4" />
						<span>{story.date}</span>
					</div>
					<div className="flex items-center">
						<Clock className="mr-1 h-4 w-4" />
						<span>{story.readingTime}</span>
					</div>
				</div>
			</div>

			<div className="newspaper-card">
				<div className="max-w-none space-y-3 font-story text-lg text-paper-charcoal dark:text-paper-vanilla">
					{story.content.split("\n\n").map((paragraph, index) => (
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
						<div className="flex items-center">
							{[1, 2, 3, 4, 5].map((star) => (
								<Star
									key={star}
									className={`h-4 w-4 ${star <= Math.floor(story.rating) ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`}
								/>
							))}
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							<Share2 className="h-4 w-4" />
							Share
						</Button>
						<Button size="sm">Rate This Story</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
