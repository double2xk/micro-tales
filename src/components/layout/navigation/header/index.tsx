import {Button} from "@/components/ui/button";
import {siteContent} from "@/utils/site-content";
import {AlbumIcon, CircleUserIcon, PencilLineIcon, TextIcon} from "lucide-react";
import Link from "next/link";

const Header = () => {
	return (
		<header className="sticky top-0 z-10 bg-background py-6">
			<div className="container-centered flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<AlbumIcon />
					<span className="font-bold text-xl">MicroTales</span>
				</Link>
				<nav className="hidden gap-10 md:flex [&>a]:transition-all [&>a]:hover:font-semibold">
					<Link
						href={siteContent.links.stories.href}
						className={"group relative flex items-center hover:pl-5"}
					>
						<TextIcon
							className={
								"absolute left-0 size-4 opacity-0 transition-opacity group-hover:opacity-100"
							}
						/>
						Browse
					</Link>
					<Link
						href={siteContent.links.submit.href}
						className={"group relative flex items-center hover:pl-5"}
					>
						<PencilLineIcon
							className={
								"absolute left-0 size-4 opacity-0 transition-opacity group-hover:opacity-100"
							}
						/>
						Submit
					</Link>
					<Link
						href={siteContent.links.author.href.replace("{id}", "12345")}
						className={"group relative flex items-center hover:pl-5"}
					>
						<CircleUserIcon
							className={
								"absolute left-0 size-4 opacity-0 transition-opacity group-hover:opacity-100"
							}
						/>
						Profile
					</Link>
				</nav>
				<div className="flex gap-2">
					<Button variant="ghost" size="sm" asChild={true}>
						<Link href={siteContent.links.login.href}>Log In</Link>
					</Button>
					<Button size="sm" asChild={true}>
						<Link href={siteContent.links.signup.href}>Sign Up</Link>
					</Button>
				</div>
			</div>
		</header>
	);
};

export default Header;
