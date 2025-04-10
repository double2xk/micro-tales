import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {siteContent} from "@/utils/site-content";
import {Calendar, Edit, Eye, EyeOff, PencilIcon, PlusIcon, Star, Trash2} from "lucide-react";
import Link from "next/link";

const myID = "12345"; // This would be fetched from an API in a real implementation

export default function ProfilePage({ params }: { params: { id: string } }) {
	// This would be fetched from an API in a real implementation
	const author = {
		id: myID,
		username: "Sarah Johnson",
		joinDate: "2023-05-12",
		totalStories: 8,
		averageRating: 4.3,
	};

	const isMyProfile = params.id === myID;

	const stories = [
		{
			id: "1",
			title: "The Last Light",
			genre: "Sci-Fi",
			date: "2023-11-15",
			rating: 4.5,
			public: true,
		},
		{
			id: "2",
			title: "Echoes of Tomorrow",
			genre: "Sci-Fi",
			date: "2023-10-22",
			rating: 4.2,
			public: true,
		},
		{
			id: "3",
			title: "The Visitor",
			genre: "Mystery",
			date: "2023-09-05",
			rating: 4.7,
			public: true,
		},
		{
			id: "4",
			title: "Draft: New Beginnings",
			genre: "Romance",
			date: "2023-08-17",
			rating: 3.9,
			public: false,
		},
	];

	return (
		<div className="container-centered py-12">
			<div className="mx-auto grid max-w-[900px] gap-8 lg:grid-cols-[300px_1fr]">
				<div>
					<Card>
						<CardHeader>
							<div className="mb-2 flex justify-center">
								<Avatar className="size-24 text-xl uppercase">
									<AvatarFallback>
										{author.username.substring(0, 2)}
									</AvatarFallback>
								</Avatar>
							</div>
							<CardTitle className="text-center">{author.username}</CardTitle>
							<CardDescription className="flex items-center justify-center gap-1 text-center">
								<Calendar className="h-3 w-3" />
								Joined {author.joinDate}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">Stories</span>
									<span className="font-medium">{author.totalStories}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">
										Average Rating
									</span>
									<div className="flex items-center">
										<span className="mr-1 font-medium">
											{author.averageRating}
										</span>
										<Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
									</div>
								</div>
							</div>
						</CardContent>
						{isMyProfile && (
							<CardFooter>
								<Button className="w-full">
									<PencilIcon />
									Edit Profile
								</Button>
							</CardFooter>
						)}
					</Card>
				</div>

				<div className={"w-full"}>
					<div className="mb-6 flex items-center justify-between">
						<h1 className="font-bold font-serif text-3xl">
							{isMyProfile ? "My Stories" : `${author.username}'s Stories`}
						</h1>
						{isMyProfile && (
							<Button asChild={true}>
								<Link href={siteContent.links.submit.href}>
									<PlusIcon />
									New Story
								</Link>
							</Button>
						)}
					</div>

					<div className="space-y-4">
						{stories.map((story) => (
							<div
								key={story.id}
								className="flex flex-col items-start justify-between rounded-lg border p-4 sm:flex-row sm:items-center"
							>
								<div className="mb-2 sm:mb-0">
									<div className="flex items-center gap-2">
										<h3 className="font-medium">{story.title}</h3>
										{!story.public && (
											<Badge variant="outline" className="text-xs">
												Draft
											</Badge>
										)}
									</div>
									<div className="mt-2 flex items-center gap-3 text-muted-foreground text-sm">
										<Badge variant="secondary">{story.genre}</Badge>
										<span>{story.date}</span>
										<div className="flex items-center">
											<span className="mr-1">{story.rating}</span>
											<Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
										</div>
										<div className="flex items-center">
											{story.public ? (
												<Eye className="mr-1 h-3 w-3" />
											) : (
												<EyeOff className="mr-1 h-3 w-3" />
											)}
											<span>{story.public ? "Public" : "Private"}</span>
										</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" asChild={true}>
										<Link
											href={siteContent.links.story.href.replace(
												"{id}",
												story.id,
											)}
										>
											View
										</Link>
									</Button>
									{isMyProfile && (
										<>
											<Button variant="outline" size="sm">
												<Edit className="h-3 w-3" />
												Edit
											</Button>
											<Button
												variant="outline"
												size="sm"
												className={"!text-destructive"}
											>
												<Trash2 className="h-3 w-3" />
												Delete
											</Button>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
