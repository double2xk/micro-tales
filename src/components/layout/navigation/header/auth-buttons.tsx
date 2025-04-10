"use client";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {siteContent} from "@/utils/site-content";
import {ChevronDown, LogOutIcon, UserCircleIcon} from "lucide-react";
import type {Session} from "next-auth";
import {signOut} from "next-auth/react";
import Link from "next/link";

const HeaderAuthButtons = ({ user }: { user: Session["user"] | null }) => {
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
							>
								<UserCircleIcon />
								Profile
							</Link>
						</Button>
						<Button
							variant={"ghost"}
							size={"sm"}
							className={"!text-destructive"}
							onClick={() => {
								signOut();
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
};

export default HeaderAuthButtons;
