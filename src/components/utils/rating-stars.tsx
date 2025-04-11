"use client";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {api} from "@/trpc/react";
import {Star} from "lucide-react";
import {useSession} from "next-auth/react";
import {useState} from "react";
import {toast} from "sonner";

const RatingStars = ({ rating }: { rating: number }) => {
	return (
		<div className="flex items-center">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={`size-5 ${star <= Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`}
				/>
			))}
		</div>
	);
};

const RatingStarsWithAction = ({
	rating,
	storyId,
}: { rating: number; storyId: string }) => {
	const [ratingState, setRatingState] = useState(rating);
	const [hoveredRating, setHoveredRating] = useState<number | null>(null);
	const session = useSession();
	const rateAction = api.rating.rateStory.useMutation({
		mutationKey: ["rateStory"],
		onSuccess: async (data) => {
			if (data.success) {
				toast.success("Rated successfully");
			} else {
				setRatingState(rating);
			}
		},
		onError: (e) => {
			toast.error(e.message);
			setRatingState(rating);
		},
	});

	const handleRate = (newRating: number) => {
		if (!session.data?.user?.id) {
			toast.error("You must be logged in to rate a story");
			return;
		}
		if (ratingState === newRating) {
			toast.error("You have already rated this story");
			return;
		}

		setRatingState(newRating);

		rateAction.mutate({
			storyId,
			rating: newRating,
			userId: session.data.user.id,
		});
	};

	return (
		<div className="flex items-center">
			{[1, 2, 3, 4, 5].map((star) => (
				<Button
					key={star}
					variant={"link"}
					size={"icon"}
					className={"size-fit"}
					onClick={() => handleRate(star)}
					onMouseEnter={() => setHoveredRating(star)}
					onMouseLeave={() => setHoveredRating(null)}
				>
					<Star
						className={cn(
							"size-5 transition-colors",
							hoveredRating !== null
								? star <= hoveredRating
									? "text-yellow-500"
									: "text-foreground/20"
								: star <= Math.floor(ratingState)
									? "fill-yellow-500 text-yellow-500"
									: "text-foreground/20",
						)}
					/>
				</Button>
			))}
		</div>
	);
};

export { RatingStars, RatingStarsWithAction };
