"use client";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {StoryGenre} from "@/server/db/schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {BadgeInfoIcon, InfoIcon} from "lucide-react";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";

const submitStoryFormSchema = z
	.object({
		title: z
			.string()
			.min(3, { message: "Title must be at least 3 characters" })
			.max(100, { message: "Title must be less than 100 characters" }),
		genre: z.nativeEnum(StoryGenre).or(z.literal("")),
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
	defaultValues?: SubmitStoryFormValues;
	isLoading?: boolean;
	disabledFields?: Array<keyof SubmitStoryFormValues>;
}

const SubmitStoryForm = (props: Props) => {
	const session = useSession();
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
			...props.defaultValues,
		},
	});

	const content = form.watch("content");
	const isGuest = form.watch("isGuest");
	const isDisabled = (field: keyof SubmitStoryFormValues) =>
		props.disabledFields?.includes(field);

	// Update word count when content changes
	useEffect(() => {
		const words = content
			? content.trim().split(/\s+/).filter(Boolean).length
			: 0;
		setWordCount(words);
	}, [content]);

	useEffect(() => {
		if (!session.data?.user?.id && isGuest === true) {
			form.setValue("isPublic", true);
		}
	}, [isGuest, session, form]);

	return (
		<Card className={"fade-in animate-in p-6 duration-500"}>
			{isGuest && (
				<Alert variant={"info"}>
					<BadgeInfoIcon className="!size-4.5" />
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
										disabled={props.isLoading || isDisabled("title")}
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
									disabled={props.isLoading || isDisabled("genre")}
								>
									<FormControl>
										<SelectTrigger className="w-full max-w-[10rem]">
											<SelectValue placeholder="Select a genre" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.entries(StoryGenre).map(([key, value]) => (
											<SelectItem key={value} value={value}>
												{key}
											</SelectItem>
										))}
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
										disabled={props.isLoading || isDisabled("content")}
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
									<FormDescription className={"inline-flex items-center"}>
										Make your story visible to all users
										<Popover>
											<PopoverTrigger className={"ml-1.5 cursor-pointer"}>
												<InfoIcon className={"size-4 text-muted-foreground"} />
											</PopoverTrigger>
											<PopoverContent
												align={"center"}
												side={"top"}
												className={
													"w-max whitespace-nowrap bg-primary text-center"
												}
											>
												<p className={"text-primary-foreground text-xs"}>
													Private stories are hidden from guests.
												</p>
											</PopoverContent>
										</Popover>
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={
											props.isLoading || isDisabled("isPublic") || isGuest
										}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					{!session.data?.user?.id && (
						<>
							<FormField
								control={form.control}
								name="isGuest"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start gap-3">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={props.isLoading || isDisabled("isGuest")}
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
													disabled={props.isLoading || isDisabled("email")}
												/>
											</FormControl>
											<FormDescription>
												We'll send you a security code to edit your story later.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</>
					)}
					<Button
						type="submit"
						size={"lg"}
						className="w-full"
						disabled={props.isLoading}
					>
						{props.isLoading ? "Submitting..." : "Submit Story"}
					</Button>
				</form>
			</Form>
		</Card>
	);
};

export const SubmitStoryFormSkeleton = () => {
	return (
		<Card className="space-y-4 p-6">
			{/* Title Input Skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>

			{/* Genre Select Skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-10 w-40 rounded-lg" />
			</div>

			{/* Content Textarea Skeleton */}
			<div className="space-y-2">
				<div className="flex justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-16" />
				</div>
				<Skeleton className="h-32 w-full rounded-lg" />
			</div>

			{/* Visibility Toggle Skeleton */}
			<div className="flex items-center justify-between rounded-lg bg-muted/80 p-4">
				<div className="space-y-1">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-3 w-48" />
				</div>
				<Skeleton className="h-6 w-10 rounded-full" />
			</div>

			{/* Guest Checkbox Skeleton */}
			<div className="flex items-start gap-3">
				<Skeleton className="h-4 w-4 rounded" />
				<div className="space-y-1">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-3 w-44" />
				</div>
			</div>

			{/* Submit Button Skeleton */}
			<Skeleton className="h-10 w-full rounded-lg" />
		</Card>
	);
};

export default SubmitStoryForm;
