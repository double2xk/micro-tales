"use client";

import {Button, type buttonVariants} from "@/components/ui/button";
import {api} from "@/trpc/react";
import type {VariantProps} from "class-variance-authority";
import {Trash2} from "lucide-react";
import type {ComponentProps} from "react";
import {toast} from "sonner";

type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>;

interface Props extends Omit<ButtonProps, "onClick" | "children"> {
	storyId: string;
	authorId?: string;
}

export default function DeleteStoryButton({
	storyId,
	authorId,
	...props
}: Props) {
	const utils = api.useUtils();

	const deleteAction = api.story.deleteStory.useMutation({
		mutationKey: ["deleteStory"],
		onSuccess: async (data) => {
			if (data.success) {
				toast.success(data.message);
				if (authorId) {
					void utils.story.getStoriesByAuthorId.invalidate({
						authorId: authorId,
					});
				}
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
			onClick={() => deleteAction.mutate({ id: storyId })}
			disabled={deleteAction.isPending}
			{...props}
		>
			<Trash2 className="h-3 w-3" />
			Delete
		</Button>
	);
}
