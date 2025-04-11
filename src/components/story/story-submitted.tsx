import {Button} from "@/components/ui/button";
import {Card, CardFooter} from "@/components/ui/card";
import {siteContent} from "@/utils/site-content";
import {PencilLineIcon} from "lucide-react";
import Link from "next/link";

export default function StorySubmitted(props: {
	isGuest: boolean;
	secret: string;
	onSubmitAnother: () => void;
}) {
	const { isGuest, secret, onSubmitAnother } = props;
	return (
		<Card className={"fade-in animate-in p-6 text-center duration-500"}>
			<SuccessIcon />
			<h2 className="font-bold font-serif text-2xl">
				Story Submitted Successfully!
			</h2>
			<p className="px-4 text-muted-foreground">
				{isGuest ? (
					"Your story has been submitted as a guest. Save your security code to edit your story later."
				) : (
					<span>
						Your story has been submitted. <br /> You can view or edit it in
						your{" "}
						<Link
							className={"underline"}
							href={siteContent.links.authorBase.href}
						>
							profile
						</Link>
						.
					</span>
				)}
			</p>
			{isGuest && (
				<div className="mx-auto max-w-sm rounded-lg border border-purple-300 border-dashed bg-purple-50 p-4">
					<h3 className="mb-2 font-medium">Your Security Code</h3>
					<div className="rounded-md bg-background p-3 text-center font-mono text-lg">
						{secret}
					</div>
					<p className="mt-2 text-muted-foreground text-xs">
						Keep this code safe. You'll need it to edit your story.
					</p>
				</div>
			)}
			<CardFooter className={"justify-center gap-4"}>
				<Button variant="outline" className="w-full sm:w-auto" asChild={true}>
					<Link href={siteContent.links.stories.href}>Browse Stories</Link>
				</Button>
				<Button
					className="w-full sm:w-auto"
					onClick={() => {
						onSubmitAnother();
					}}
				>
					Submit Another Story
				</Button>
			</CardFooter>
			{isGuest && (
				<Button variant="link" className="mx-auto w-max" asChild={true}>
					<Link href={siteContent.links.claimStory.href}>
						<PencilLineIcon />
						Manage Your Story
					</Link>
				</Button>
			)}
		</Card>
	);
}

const SuccessIcon = () => (
	<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-8 w-8 text-green-600 dark:text-green-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<title>Success</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 13l4 4L19 7"
			/>
		</svg>
	</div>
);
