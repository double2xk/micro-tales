"use client";

import SubmitStoryForm, {type SubmitStoryFormValues,} from "@/components/forms/submit-story-form";
import BackToStories from "@/components/utils/back-to-stories";
import type {StoryGenre} from "@/server/db/schema";
import {api} from "@/trpc/react";
import {useState} from "react";
import {toast} from "sonner";
import StorySubmitted from "@/components/story/story-submitted";

export default function SubmitPage() {
	const [submitted, setSubmitted] = useState(false);
	const [secret, setSecret] = useState("");
	const [isGuest, setIsGuest] = useState(false);

	const submitAction = api.story.createStory.useMutation({
		mutationKey: ["createStory"],
		onSuccess: (story) => {
			if (story?.id) {
				setSubmitted(true);
			} else {
				toast.error("Error submitting story");
			}
		},
	});

	const submitGuestAction = api.story.createGuestStory.useMutation({
		mutationKey: ["createGuestStory"],
		onSuccess: (data) => {
			if (data.secret) {
				setSecret(data.secret);
				setSubmitted(true);
			} else {
				toast.error("Error generating security code");
			}
		},
	});

	async function onSubmit(values: SubmitStoryFormValues) {
		setIsGuest(values.isGuest);

		if (values.isGuest) {
			submitGuestAction.mutate({
				...values,
				genre: values.genre as StoryGenre,
			});
		} else {
			submitAction.mutate({ ...values, genre: values.genre as StoryGenre });
		}
	}

	return (
		<div className={"container-centered max-w-lg py-12"}>
			<BackToStories />
			<div className="mb-8">
				<h1 className="mb-2 font-bold font-serif text-3xl">
					Submit Your Story
				</h1>
				<p className="text-muted-foreground">
					Share your micro fiction with our community. Stories must be under 500
					words.
				</p>
			</div>
			{submitted ? (
				<StorySubmitted
					isGuest={isGuest}
					secret={secret}
					onSubmitAnother={() => setSubmitted(false)}
				/>
			) : (
				<SubmitStoryForm onSubmit={onSubmit} />
			)}
		</div>
	);
}
