import {Button} from "@/components/ui/button";
import {siteContent} from "@/utils/site-content";
import Link from "next/link";

const Header = () => {
	return (
		<header className="sticky top-0 z-10 bg-background px-4 py-6 md:px-6">
			<div className="container-centered flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<span className="font-bold text-xl">MicroTales</span>
				</Link>
				<nav className="hidden gap-6 md:flex">
					<Link href={siteContent.links.browse.href}>Browse</Link>
					<Link href={siteContent.links.submit.href}>Submit</Link>
					<Link href={siteContent.links.profile.href}>Profile</Link>
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
