"use client";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {api} from "@/trpc/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {signIn, useSession} from "next-auth/react";
import Link from "next/link";
import {useForm} from "react-hook-form";
import * as z from "zod";

const formSchema = z
	.object({
		firstName: z
			.string()
			.min(3, { message: "First name must be at least 3 characters" }),
		lastName: z
			.string()
			.min(3, { message: "Last name must be at least 3 characters" }),
		email: z.string().email({ message: "Please enter a valid email address" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: z.string(),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function SignupPage() {
	const { data, status } = useSession();
	console.log(status);
	console.log(data);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	const signUpAction = api.auth.signUp.useMutation({
		mutationKey: ["signUp"],
		onSuccess: async (data, prev) => {
			console.log("data", data);
			if (data?.user?.id) {
				console.log("DATA", data);
				await signIn("credentials", {
					...prev,
					redirectTo: "/",
				});
			}
		},
		onError: async (data) => {
			console.log(data.message);
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// This would connect to your registration API in a real implementation
		void signUpAction.mutate({
			name: `${values.firstName} ${values.lastName}`,
			email: values.email,
			password: values.password,
		});
	}

	return (
		<div className="container-centered max-w-md space-y-6 py-12">
			<div className="space-y-2 text-center">
				<h1 className="font-bold font-serif text-3xl">Create an Account</h1>
				<p className="text-muted-foreground">
					Enter your information to create an account
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First Name</FormLabel>
								<FormControl>
									<Input placeholder="John" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last Name</FormLabel>
								<FormControl>
									<Input placeholder="Doe" {...field} />
								</FormControl>
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
									<Input type="email" placeholder="m@example.com" {...field} />
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
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder={"********"} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="terms"
						render={({ field }) => (
							<FormItem>
								<div className={"flex flex-row items-start gap-3"}>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel className="inline text-sm">
										I agree to the{" "}
										<Link href="/terms" className="inline underline">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="/privacy" className="inline underline">
											Privacy Policy
										</Link>
									</FormLabel>
								</div>

								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full"
						size={"lg"}
						disabled={signUpAction.isPending || form.formState.isLoading}
					>
						Create Account
					</Button>
				</form>
			</Form>
			<div className="text-center text-sm">
				Already have an account?{" "}
				<Link href="/login" className="underline">
					Sign in
				</Link>
			</div>
		</div>
	);
}
