"use client";

import SubmitStoryForm, {type SubmitStoryFormValues,} from "@/components/forms/submit-story-form";
import StorySubmitted from "@/components/story/story-submitted";
import BackToStories from "@/components/utils/back-to-stories";
import {api} from "@/trpc/react";
import {siteContent} from "@/utils/site-content";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";

export default function SubmitPage() {
	const session = useSession();
	const router = useRouter();
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

	const submitWithRegisterTokenAction =
		api.story.createStoryWithRegisterToken.useMutation({
			mutationKey: ["claimStory"],
			onSuccess: (data) => {
				if (data.token) {
					router.push(
						`${siteContent.links.signup.href}?storyToken=${data.token}`,
					);
				} else {
					toast.error("Error generating security code");
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
		if (values.isGuest) {
			setIsGuest(values.isGuest);
			submitGuestAction.mutate({ ...values });
		} else {
			if (!session.data?.user?.id) {
				submitWithRegisterTokenAction.mutate({ ...values });
			} else {
				submitAction.mutate({ ...values });
			}
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
				<SubmitStoryForm
					onSubmit={onSubmit}
					isLoading={
						submitAction.isPending ||
						submitWithRegisterTokenAction.isPending ||
						submitGuestAction.isPending
					}
				/>
			)}
		</div>
	);
}
