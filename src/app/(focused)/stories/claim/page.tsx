"use client";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {siteContent} from "@/utils/site-content";
import {zodResolver} from "@hookform/resolvers/zod"
import {CheckCircle2, XCircle} from "lucide-react"
import Link from "next/link"
import {useRouter} from "next/navigation";
import {useState} from "react"
import {useForm} from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
	securityCode: z
		.string()
		.min(1, { message: "Security code is required" })
		.regex(/^TALE-\d{4}-[A-Z]{4}$/, {
			message: "Invalid security code format",
		}),
	email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ClaimStoryPage() {
	const router = useRouter();
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			securityCode: "",
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// This would connect to your API to verify the security code and email
		console.log(values);

		// Simulate API response
		setTimeout(() => {
			// For demo purposes, we'll consider TALE-1234-ABCD as a valid code
			if (values.securityCode === "TALE-1234-ABCD") {
				setStatus("success");
				setTimeout(() => {
					router.push(
						`${siteContent.links.editStory.href.replace("{id}", "1234")}?token=someToken`,
					);
				}, 2000);
			} else {
				setStatus("error");
			}
		}, 1000);
	}

	return (
		<div className="mx-auto w-full max-w-md">
			<Card>
				<CardHeader className="space-y-2">
					<CardTitle className="font-serif text-3xl">
						Claim Your Story
					</CardTitle>
					<CardDescription className="text-base text-muted-foreground">
						Enter your security code and email to edit or manage your guest
						submission
					</CardDescription>
				</CardHeader>
				<CardContent>
					{status === "success" && (
						<Alert className="mb-6 border-green-500 border-dashed bg-green-50/80 text-green-800">
							<CheckCircle2 className="!size-4.5" />
							<AlertTitle>Success!</AlertTitle>
							<AlertDescription>
								Your story has been found. You will be redirected to the edit
								page.
							</AlertDescription>
						</Alert>
					)}

					{status === "error" && (
						<Alert className="mb-6 border-red-200 border-dashed bg-red-50 text-red-800">
							<XCircle className="!size-4.5" />
							<AlertTitle>Story not found</AlertTitle>
							<AlertDescription>
								We couldn't find a story with that security code and email
								combination. Please check and try again.
							</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="securityCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Security Code</FormLabel>
										<FormControl>
											<Input
												placeholder="TALE-1234-ABCD"
												{...field}
												disabled={status === "success"}
											/>
										</FormControl>
										<FormDescription>
											This is the code you received when submitting <br /> your
											story as a guest
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="your@email.com"
												{...field}
												disabled={status === "success"}
											/>
										</FormControl>
										<FormDescription>
											The email you used when submitting your story
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className={"pt-3"}>
								<Button
									type="submit"
									className="w-full"
									size={"lg"}
									disabled={status === "success"}
								>
									{status === "success" ? "Redirecting..." : "Claim Story"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex-col text-center text-muted-foreground text-sm">
					<p>Don't have a security code?</p>
					<Link
						href="/submit"
						className="font-medium text-primary hover:underline"
					>
						Submit a new story
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
