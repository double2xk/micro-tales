"use client";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {zodResolver} from "@hookform/resolvers/zod";
import {InfoIcon} from "lucide-react";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";

const submitStoryFormSchema = z
	.object({
		title: z
			.string()
			.min(3, { message: "Title must be at least 3 characters" })
			.max(100, { message: "Title must be less than 100 characters" }),
		genre: z.string({ required_error: "Please select a genre" }),
		content: z
			.string()
			.min(10, { message: "Story must be at least 10 characters" })
			.max(2500, { message: "Story must be less than 500 words" }),
		isPublic: z.boolean().default(true),
		isGuest: z.boolean().default(false),
		email: z
			.string()
			.email({ message: "Please enter a valid email address" })
			.optional()
			.or(z.literal("")),
	})
	.refine(
		(data) => {
			if (data.isGuest && !data.email) {
				return false;
			}
			return true;
		},
		{
			message: "Email is required for guest submissions",
			path: ["email"],
		},
	);

export type SubmitStoryFormValues = z.infer<typeof submitStoryFormSchema>;

interface Props {
	onSubmit: (data: SubmitStoryFormValues) => void;
}

const SubmitStoryForm = (props: Props) => {
	const [wordCount, setWordCount] = useState(0);

	const form = useForm<SubmitStoryFormValues>({
		resolver: zodResolver(submitStoryFormSchema),
		defaultValues: {
			title: "",
			genre: "",
			content: "",
			isPublic: true,
			isGuest: false,
			email: "",
		},
	});

	const content = form.watch("content");
	const isGuest = form.watch("isGuest");

	// Update word count when content changes
	useEffect(() => {
		const words = content
			? content.trim().split(/\s+/).filter(Boolean).length
			: 0;
		setWordCount(words);
	}, [content]);

	return (
		<Card className={"p-6"}>
			{isGuest && (
				<Alert className="border-blue-100 border-dashed bg-blue-50/50 dark:border-blue-900 ">
					<InfoIcon className="!size-4.5 text-blue-600 dark:text-blue-400" />
					<AlertTitle>Submitting as a guest</AlertTitle>
					<AlertDescription>
						You'll receive a security code to edit your story later. Make sure
						to save it!
					</AlertDescription>
				</Alert>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(props.onSubmit)}
					className="space-y-6"
				>
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Story Title</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter a captivating title"
										className="rounded-lg"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="genre"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Genre</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full max-w-[10rem]">
											<SelectValue placeholder="Select a genre" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="fable">Fable</SelectItem>
										<SelectItem value="spooky">Spooky</SelectItem>
										<SelectItem value="romance">Romance</SelectItem>
										<SelectItem value="sci-fi">Sci-Fi</SelectItem>
										<SelectItem value="mystery">Mystery</SelectItem>
										<SelectItem value="misc">Misc</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<div className="flex justify-between">
									<FormLabel>Story Content</FormLabel>
									<span
										className={`text-xs ${wordCount > 500 ? "text-destructive" : "text-muted-foreground"}`}
									>
										{wordCount}/500 words
									</span>
								</div>
								<FormControl>
									<Textarea
										placeholder="Write your story here (max 500 words)"
										className="min-h-[200px] font-serif"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isPublic"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/80 p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">Story Visibility</FormLabel>
									<FormDescription>
										Make your story visible to all users
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isGuest"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start gap-3">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Submit as guest</FormLabel>
									<FormDescription>
										Submit without creating an account
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					{isGuest && (
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email (for guest submissions)</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="your@email.com"
											className="rounded-lg"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										We'll use this to let you know when your story is published
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
					<Button type="submit" size={"lg"} className="w-full">
						Submit Story
					</Button>
				</form>
			</Form>
		</Card>
	);
};

export default SubmitStoryForm;
