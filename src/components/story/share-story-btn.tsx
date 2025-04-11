"use client";
import {Button, type buttonVariants} from "@/components/ui/button";
import {copyToClipboard} from "@/utils/copy-to-clipboard";
import {siteContent} from "@/utils/site-content";
import type {VariantProps} from "class-variance-authority";
import {Share2} from "lucide-react";
import type {ComponentProps} from "react";

type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>;

interface Props extends Omit<ButtonProps, "onClick" | "children"> {
	storyId: string;
}

export default function ShareStoryButton(props: Props) {
	const { storyId, ...rest } = props;
	return (
		<Button
			onClick={() =>
				copyToClipboard(
					`${window.location.origin}${siteContent.links.story.href.replace("{id}", props.storyId)}`,
					"Story link copied to clipboard",
				)
			}
			{...rest}
		>
			<Share2 className="h-4 w-4" />
			Share
		</Button>
	);
}
