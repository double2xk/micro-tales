"use client";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {siteContent} from "@/utils/site-content";
import {zodResolver} from "@hookform/resolvers/zod";
import {AlertTriangleIcon} from "lucide-react";
import {signIn} from "next-auth/react";
import Link from "next/link"
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
	// remember: z.boolean().default(false),
});

export default function LoginPage() {
	const [isLoading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const params = useSearchParams();
	const error = params.get("code");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			// remember: false,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true);
		// This would connect to your authentication API in a real implementation
		void signIn("credentials", { ...values, redirectTo: "/" }).catch((err) => {
			setLoading(false);
			setErrorMessage(
				err?.code === "credentials"
					? "Invalid credentials. Please try again."
					: (err.message ?? "Unknown error"),
			);
		});
	}

	useEffect(() => {
		if (error) {
			setErrorMessage(
				error === "credentials"
					? "Invalid credentials. Please try again."
					: error,
			);
		}
	}, [error]);

	return (
		<div className="container-centered max-w-md space-y-6 py-12">
			<div className="space-y-2 text-center">
				<h1 className="font-bold font-serif text-3xl">Welcome Back</h1>
				<p className="text-muted-foreground">
					Enter your credentials to sign in to your account
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="m@example.com"
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>Password</FormLabel>
									<Link
										href={siteContent.links.forgotPassword.href}
										className="text-sm underline"
									>
										Forgot password?
									</Link>
								</div>
								<FormControl>
									<Input
										type="password"
										placeholder={"********"}
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/*<FormField*/}
					{/*	control={form.control}*/}
					{/*	name="remember"*/}
					{/*	render={({ field }) => (*/}
					{/*		<FormItem className={"flex items-center gap-3 py-0.5"}>*/}
					{/*			<FormControl>*/}
					{/*				<Checkbox*/}
					{/*					checked={field.value}*/}
					{/*					onCheckedChange={field.onChange}*/}
					{/*					disabled={isLoading}*/}
					{/*				/>*/}
					{/*			</FormControl>*/}
					{/*			<FormLabel>Remember me</FormLabel>*/}
					{/*		</FormItem>*/}
					{/*	)}*/}
					{/*/>*/}
					{errorMessage ? (
						<Alert variant={"destructive"}>
							<AlertTriangleIcon />
							<AlertTitle>Authentication Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					) : null}
					<Button
						type="submit"
						size={"lg"}
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</Form>
			<div className="text-center text-sm">
				Don't have an account?{" "}
				<Link href={siteContent.links.signup.href} className="underline">
					Sign up
				</Link>
			</div>
		</div>
	);
}
