"use client";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {siteContent} from "@/utils/site-content";
import {ChevronDown, LogOutIcon, PencilLineIcon, TextIcon, UserCircleIcon,} from "lucide-react";
import {signOut, useSession} from "next-auth/react";
import Link from "next/link";

export default function HeaderAuthButtons() {
	const { data } = useSession();
	const user = data?.user;

	return (
		<div className="flex items-center gap-2">
			{user?.id ? (
				<Popover>
					<PopoverTrigger asChild={true}>
						<Button
							variant={"link"}
							className={"!p-0 hover:no-underline hover:opacity-80"}
						>
							<div
								className={
									"flex size-9 items-center justify-center rounded-full border bg-secondary uppercase"
								}
							>
								{user.name?.substring(0, 2)}
							</div>
							<ChevronDown />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						align={"end"}
						className={"flex max-w-52 flex-col gap-1 [&>*]:justify-start"}
					>
						<Button variant={"ghost"} asChild={true}>
							<Link
								href={siteContent.links.author.href.replace("{id}", user.id)}
								prefetch={true}
							>
								<UserCircleIcon />
								Profile
							</Link>
						</Button>
						<Button variant={"ghost"} className={"md:hidden"} asChild={true}>
							<Link href={siteContent.links.submit.href}>
								<PencilLineIcon />
								Submit Story
							</Link>
						</Button>
						<Button variant={"ghost"} className={"md:hidden"} asChild={true}>
							<Link href={siteContent.links.stories.href} prefetch={true}>
								<TextIcon />
								Browse Stories
							</Link>
						</Button>
						<Button
							variant={"ghost"}
							size={"sm"}
							className={"!text-destructive"}
							onClick={() => {
								void signOut({
									redirect: true,
									redirectTo: "/",
								});
							}}
						>
							<LogOutIcon />
							Sign Out
						</Button>
					</PopoverContent>
				</Popover>
			) : (
				<>
					<Button variant="ghost" size="sm" asChild={true}>
						<Link href={siteContent.links.login.href}>Log In</Link>
					</Button>
					<Button size="sm" asChild={true}>
						<Link href={siteContent.links.signup.href}>Sign Up</Link>
					</Button>
				</>
			)}
		</div>
	);
}
