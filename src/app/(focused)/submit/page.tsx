"use client";

import SubmitStoryForm, {type SubmitStoryFormValues} from "@/components/forms/submit-story-form";
import {Button} from "@/components/ui/button";
import {Card, CardFooter} from "@/components/ui/card";
import BackToStories from "@/components/utils/back-to-stories";
import {siteContent} from "@/utils/site-content";
import Link from "next/link";
import {useEffect, useState} from "react";

const generateCode = () => {
	const prefix = "TALE";
	const randomNum = Math.floor(1000 + Math.random() * 9000);
	const randomLetters = Array(4)
		.fill(0)
		.map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
		.join("");
	return `${prefix}-${randomNum}-${randomLetters}`;
};

export default function SubmitPage() {
	const [submitted, setSubmitted] = useState(false);
	const [securityCode, setSecurityCode] = useState("");
	const [isGuest, setIsGuest] = useState(false);

	// Generate a random security code on component mount
	useEffect(() => {
		setSecurityCode(generateCode());
	}, []);

	function onSubmit(values: SubmitStoryFormValues) {
		// This would connect to your story submission API in a real implementation
		console.log({ ...values, securityCode });
		setIsGuest(values.isGuest);
		setSubmitted(true);
	}

	return (
		<div className="container-centered max-w-lg py-12">
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

			{!submitted ? (
				<Card className={"p-6 text-center"}>
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
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
					<h2 className="font-bold font-serif text-2xl">
						Story Submitted Successfully!
					</h2>
					<p className="px-4 text-muted-foreground">
						{isGuest
							? "Your story has been submitted as a guest. Save your security code to edit your story later."
							: "Your story has been submitted and will be reviewed by our team."}
					</p>

					{isGuest && (
						<div className="mx-auto max-w-sm rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
							<h3 className="mb-2 font-medium">Your Security Code</h3>
							<div className="rounded-md bg-white p-3 text-center font-mono text-lg dark:bg-gray-900">
								{securityCode}
							</div>
							<p className="mt-2 text-muted-foreground text-xs">
								Keep this code safe. You'll need it to edit your story.
							</p>
						</div>
					)}
					<CardFooter className={"justify-center gap-4"}>
						<Button
							variant="outline"
							className="w-full sm:w-auto"
							asChild={true}
						>
							<Link href={siteContent.links.stories.href}>Browse Stories</Link>
						</Button>
						<Button
							className="w-full sm:w-auto"
							onClick={() => {
								setSubmitted(false);
								setSecurityCode(generateCode());
							}}
						>
							Submit Another Story
						</Button>
						{isGuest && (
							<Button
								variant="secondary"
								className="w-full sm:w-auto"
								asChild={true}
							>
								<Link href={siteContent.links.claimStory.href}>
									Manage Your Story
								</Link>
							</Button>
						)}
					</CardFooter>
				</Card>
			) : (
				<SubmitStoryForm onSubmit={onSubmit} />
			)}
		</div>
	);
}
