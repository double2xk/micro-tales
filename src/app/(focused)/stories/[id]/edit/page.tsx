"use client";
import SubmitStoryForm, {
	SubmitStoryFormSkeleton,
	type SubmitStoryFormValues,
} from "@/components/forms/submit-story-form";
import StorySubmitted from "@/components/story/story-submitted";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import BackToStories from "@/components/utils/back-to-stories";
import {StoryGenre} from "@/server/db/schema";
import {api} from "@/trpc/react";
import {siteContent} from "@/utils/site-content";
import {AlertTriangleIcon} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";

export default function EditPage() {
	const [submitted, setSubmitted] = useState(false);
	const [secret, setSecret] = useState("");

	const router = useRouter();

	const searchParams = useSearchParams();

	const editToken = searchParams.get("token");

	const story = api.editToken.getEditStoryDetailsByToken.useQuery(
		{
			token: editToken as string,
		},
		{
			enabled: !!editToken,
		},
	);

	const initialValues: SubmitStoryFormValues = {
		title: story.data?.title || "",
		genre: (story.data?.genre as StoryGenre) || StoryGenre.Misc,
		content: story.data?.content || "",
		isPublic: true,
		isGuest: true,
		email: "",
	};

	const storyEditAction = api.editToken.editStoryByToken.useMutation({
		mutationKey: ["editGuestStory"],
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
		storyEditAction.mutate({
			...values,
			token: editToken as string,
			genre: values.genre as StoryGenre,
		});
	}

	return (
		<div className={"container-centered max-w-lg py-12"}>
			<BackToStories />
			<div className="mb-8">
				<h1 className="mb-2 font-bold font-serif text-3xl">Edit Your Story</h1>
				<p className="text-muted-foreground">Edit your micro fiction.</p>
			</div>

			{submitted ? (
				<StorySubmitted
					isGuest={true}
					secret={secret}
					onSubmitAnother={() => router.push(siteContent.links.submit.href)}
				/>
			) : story.data ? (
				<SubmitStoryForm
					onSubmit={onSubmit}
					defaultValues={initialValues}
					disabledFields={["isGuest", "isPublic"]}
				/>
			) : story.error ? (
				<Alert variant={"destructive"}>
					<AlertTriangleIcon />
					<AlertTitle>Invalid Edit Token</AlertTitle>
					<AlertDescription>
						The edit token you provided is invalid or has expired.
					</AlertDescription>
				</Alert>
			) : (
				<SubmitStoryFormSkeleton />
			)}
		</div>
	);
}
