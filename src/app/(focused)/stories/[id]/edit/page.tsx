"use client";
import SubmitStoryForm, {
	SubmitStoryFormSkeleton,
	type SubmitStoryFormValues,
} from "@/components/forms/submit-story-form";
import StorySubmitted from "@/components/story/story-submitted";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import BackToStories from "@/components/utils/back-to-stories";
import {StoryGenre} from "@/server/db/schema";
import {api} from "@/trpc/react";
import {siteContent} from "@/utils/site-content";
import {AlertTriangleIcon, TrashIcon, UserRoundPlus} from "lucide-react";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";

export default function EditPage() {
	const { id: storyId } = useParams();

	const [submitted, setSubmitted] = useState(false);
	const [secret, setSecret] = useState("");

	const session = useSession();
	const router = useRouter();
	const editToken = useSearchParams().get("token");

	const isGuest = !session.data?.user?.id;

	const story = isGuest
		? api.editToken.getEditStoryDetailsByToken.useQuery(
				{
					token: editToken as string,
				},
				{
					enabled: !!editToken,
				},
			)
		: api.story.getStoryById.useQuery(
				{
					id: storyId as string,
				},
				{
					enabled: !!storyId,
				},
			);

	console.log(story);

	const initialValues: SubmitStoryFormValues = {
		title: story.data?.title || "",
		genre: (story.data?.genre as StoryGenre) || StoryGenre.Misc,
		content: story.data?.content || "",
		isPublic: isGuest ? true : story.data?.isPublic || true,
		isGuest: isGuest,
	};

	const storyEditByTokenAction = api.editToken.editStoryByToken.useMutation({
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

	const storyDeleteAction = api.story.deleteStory.useMutation({
		mutationKey: ["deleteStory"],
		onSuccess: (data) => {
			if (data.success) {
				toast.success("Story deleted successfully", {
					description: "Redirecting to profile...",
				});
				setTimeout(() => {
					router.push(siteContent.links.authorBase.href);
				}, 2000);
			} else {
				toast.error(data?.message ?? "Error deleting story");
			}
		},
		onError: (error) => {
			toast.error(error.message ?? "Error deleting story");
		},
	});

	const storyDeleteByTokenAction = api.editToken.deleteStoryByToken.useMutation(
		{
			mutationKey: ["deleteGuestStory"],
			onSuccess: (data) => {
				if (data.success) {
					toast.success("Story deleted successfully", {
						description: "Redirecting to home page...",
					});
					setTimeout(() => {
						router.push("/");
					}, 2000);
				} else {
					toast.error(data?.message ?? "Error deleting story");
				}
			},
			onError: (error) => {
				toast.error(error.message ?? "Error deleting story");
			},
		},
	);

	const storyEditAction = api.story.updateStory.useMutation({
		mutationKey: ["editStory"],
		onSuccess: (data) => {
			if (data.success) {
				setSubmitted(true);
				toast.success("Story updated successfully");
			} else {
				toast.error(data?.message ?? "Error updating story");
			}
		},
		onError: () => {
			toast.error("Error updating story");
		},
	});

	async function onSubmit(values: SubmitStoryFormValues) {
		isGuest
			? storyEditByTokenAction.mutate({
					...values,
					token: editToken as string,
					genre: values.genre as StoryGenre,
				})
			: storyEditAction.mutate({ ...values, id: story?.data?.id || "" });
	}

	return (
		<div className={"container-centered max-w-lg py-12"}>
			<BackToStories />
			<div className={"mb-8 flex flex-col items-start justify-between gap-3"}>
				<div>
					<h1 className="mb-2 font-bold font-serif text-3xl">
						Edit Your Story
					</h1>
					<p className="text-muted-foreground">Edit your micro fiction.</p>
				</div>
				{story.data ? (
					<div className={"flex gap-2"}>
						{!story?.data?.authorId && (
							<Button asChild={true} className={"max-sm:w-full"}>
								<Link
									href={`${
										session.data?.user?.id
											? siteContent.links.callbackClaim.href
											: siteContent.links.signup.href
									}?storyToken=${editToken}`}
								>
									<UserRoundPlus />
									Claim to your account
								</Link>
							</Button>
						)}
						<Button
							variant={"outline"}
							className={"!text-destructive"}
							onClick={() => {
								session.data?.user?.id
									? storyDeleteAction.mutate({
											id: storyId as string,
										})
									: storyDeleteByTokenAction.mutate({
											token: editToken as string,
										});
							}}
						>
							<TrashIcon />
							Delete
						</Button>
					</div>
				) : null}
			</div>

			{submitted ? (
				<StorySubmitted
					isGuest={isGuest}
					secret={secret}
					onSubmitAnother={() => router.push(siteContent.links.submit.href)}
				/>
			) : story.data ? (
				<SubmitStoryForm
					onSubmit={onSubmit}
					defaultValues={initialValues}
					disabledFields={isGuest ? ["isPublic", "isGuest"] : ["isGuest"]}
					isLoading={
						storyEditAction.isPending ||
						storyEditByTokenAction.isPending ||
						storyDeleteByTokenAction.isPending
					}
				/>
			) : story.error ? (
				<Alert variant={"destructive"}>
					<AlertTriangleIcon />
					<AlertTitle>
						{story.error.data?.code === "NOT_FOUND"
							? "Story not found"
							: "Error fetching story"}
					</AlertTitle>
					<AlertDescription>
						{story.error.message ??
							"The edit token you provided is invalid or has expired."}
					</AlertDescription>
				</Alert>
			) : (
				<SubmitStoryFormSkeleton />
			)}
		</div>
	);
}
