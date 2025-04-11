"use client";

import {Button} from "@/components/ui/button";
import {api} from "@/trpc/react";
import {Trash2} from "lucide-react";
import {toast} from "sonner";

export default function DeleteStoryButton(props: {
	storyId: string;
	authorId: string;
}) {
	const utils = api.useUtils();

	const deleteAction = api.story.deleteStory.useMutation({
		mutationKey: ["deleteStory"],
		onSuccess: async (data) => {
			if (data.success) {
				toast.success(data.message);
				void utils.story.getStoriesByAuthorId.invalidate({
					authorId: props.authorId,
				});
			} else {
				toast.error(data.message ?? "Failed to delete story");
			}
		},
	});

	return (
		<Button
			variant="secondary"
			size="sm"
			className={"!text-destructive"}
			onClick={() => deleteAction.mutate({ id: props.storyId })}
			disabled={deleteAction.isPending}
		>
			<Trash2 className="h-3 w-3" />
			Delete
		</Button>
	);
}
